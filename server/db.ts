import { and, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomBytes } from "node:crypto";
import {
  activityLogs,
  clients,
  customerCredentials,
  freelancerProfiles,
  invoiceItems,
  invoicePayments,
  invoices,
  invoiceViews,
  paymentRequests,
  platformSettings,
  subscriptions,
  type InsertUser,
  type User,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  if (!_db) throw new Error("Database is not configured");
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  const values: InsertUser = {
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? null,
    lastSignedIn: user.lastSignedIn ?? new Date(),
    role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
  };

  await db.insert(users).values(values).onDuplicateKeyUpdate({
    set: {
      name: values.name,
      email: values.email,
      loginMethod: values.loginMethod,
      lastSignedIn: values.lastSignedIn,
      ...(user.openId === ENV.ownerOpenId ? { role: "admin" } : {}),
    },
  });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function invalidateCustomerSessions(userId: number) {
  const db = await getDb();
  await db
    .update(users)
    .set({ customerSessionVersion: sql`${users.customerSessionVersion} + 1` })
    .where(eq(users.id, userId));
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result[0];
}

export async function createCustomerAccount(input: { name: string; email: string; passwordHash: string }) {
  const db = await getDb();
  const email = input.email.toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) throw new Error("An account already uses this email address");
  const trialEndsAt = new Date(Date.now() + 14 * 86_400_000);
  const userId = await db.transaction(async tx => {
    const created = await tx.insert(users).values({
      openId: `customer_${randomBytes(18).toString("base64url")}`,
      name: input.name.trim(),
      email,
      loginMethod: "password",
      role: "user",
      lastSignedIn: new Date(),
    });
    const id = Number(created[0].insertId);
    await tx.insert(customerCredentials).values({ userId: id, passwordHash: input.passwordHash });
    await tx.insert(subscriptions).values({ userId: id, status: "trial", planCode: "solo", trialEndsAt });
    await tx.insert(activityLogs).values({ userId: id, entityType: "account", entityId: null, action: "trial_started", detail: "Started a 14-day InvoicePro trial" });
    return id;
  });
  const user = await getUserById(userId);
  if (!user) throw new Error("Customer account could not be created");
  return user;
}

export async function getCustomerCredentialByEmail(email: string) {
  const db = await getDb();
  const result = await db.select({ user: users, credential: customerCredentials })
    .from(users)
    .innerJoin(customerCredentials, eq(customerCredentials.userId, users.id))
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return result[0] ?? null;
}

export function toPaisa(amount: number) {
  return Math.round(amount * 100);
}

export function fromPaisa(amountPaisa: number) {
  return amountPaisa / 100;
}

function dateFromMillis(value?: number | null) {
  return typeof value === "number" ? new Date(value) : null;
}

export function isPastDue(dueDate: Date | null, paidAmountPaisa: number, totalPaisa: number) {
  return Boolean(dueDate && dueDate.getTime() < Date.now() && paidAmountPaisa < totalPaisa);
}

async function logActivity(
  userId: number,
  entityType: string,
  entityId: number | null,
  action: string,
  detail: string,
) {
  const db = await getDb();
  await db.insert(activityLogs).values({ userId, entityType, entityId, action, detail });
}

async function uniqueToken() {
  return randomBytes(24).toString("base64url");
}

export async function getProfile(userId: number) {
  const db = await getDb();
  const result = await db.select().from(freelancerProfiles).where(eq(freelancerProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function saveProfile(
  userId: number,
  input: {
    businessName: string;
    logoUrl?: string | null;
    phone: string;
    email: string;
    bkashNumber?: string | null;
    nagadNumber?: string | null;
    rocketNumber?: string | null;
    bankTransferInstructions?: string | null;
  },
) {
  const db = await getDb();
  await db.insert(freelancerProfiles).values({ userId, ...input }).onDuplicateKeyUpdate({ set: input });
  await logActivity(userId, "profile", null, "updated", "Updated business profile and payment instructions");
  return getProfile(userId);
}

export async function listClients(userId: number) {
  const db = await getDb();
  return db.select().from(clients).where(eq(clients.userId, userId)).orderBy(desc(clients.updatedAt));
}

export async function createClient(
  userId: number,
  input: { name: string; email?: string | null; phone?: string | null; address?: string | null },
) {
  const db = await getDb();
  const result = await db.insert(clients).values({ userId, ...input });
  const id = Number(result[0].insertId);
  await logActivity(userId, "client", id, "created", `Added client ${input.name}`);
  const client = await db.select().from(clients).where(and(eq(clients.id, id), eq(clients.userId, userId))).limit(1);
  return client[0];
}

export async function updateClient(
  userId: number,
  clientId: number,
  input: { name: string; email?: string | null; phone?: string | null; address?: string | null },
) {
  const db = await getDb();
  const result = await db.update(clients).set(input).where(and(eq(clients.id, clientId), eq(clients.userId, userId)));
  if (result[0].affectedRows === 0) throw new Error("Client not found");
  await logActivity(userId, "client", clientId, "updated", `Updated client ${input.name}`);
  const client = await db.select().from(clients).where(and(eq(clients.id, clientId), eq(clients.userId, userId))).limit(1);
  return client[0];
}

export async function deleteClient(userId: number, clientId: number) {
  const db = await getDb();
  const result = await db.delete(clients).where(and(eq(clients.id, clientId), eq(clients.userId, userId)));
  if (result[0].affectedRows === 0) throw new Error("Client not found");
  await logActivity(userId, "client", clientId, "deleted", "Deleted client record");
  return { success: true } as const;
}

type InvoiceItemInput = { description: string; quantityHundredths: number; unitAmountPaisa: number };

export function calculateInvoice(input: { items: InvoiceItemInput[]; discountPaisa: number }) {
  const normalizedItems = input.items.map((item, index) => {
    const quantityHundredths = Math.max(1, Math.round(item.quantityHundredths));
    const unitAmountPaisa = Math.max(0, Math.round(item.unitAmountPaisa));
    return {
      description: item.description.trim(),
      quantityHundredths,
      unitAmountPaisa,
      lineTotalPaisa: Math.round((quantityHundredths * unitAmountPaisa) / 100),
      sortOrder: index,
    };
  });
  const subtotalPaisa = normalizedItems.reduce((total, item) => total + item.lineTotalPaisa, 0);
  const discountPaisa = Math.min(Math.max(0, Math.round(input.discountPaisa)), subtotalPaisa);
  return { normalizedItems, subtotalPaisa, discountPaisa, totalPaisa: subtotalPaisa - discountPaisa };
}

async function getOwnedClient(userId: number, clientId?: number | null) {
  if (!clientId) return null;
  const db = await getDb();
  const result = await db.select().from(clients).where(and(eq(clients.id, clientId), eq(clients.userId, userId))).limit(1);
  if (!result[0]) throw new Error("Selected client was not found");
  return result[0];
}

type InvoiceInput = {
  clientId?: number | null;
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  billingType: "fixed_price" | "itemized";
  dueDate?: number | null;
  discountPaisa: number;
  notes?: string | null;
  items: InvoiceItemInput[];
};

function cleanInvoiceInput(input: InvoiceInput, client: Awaited<ReturnType<typeof getOwnedClient>>) {
  const fallbackName = input.clientName?.trim() || "";
  const clientName = client?.name ?? fallbackName;
  if (!clientName) throw new Error("Client name is required");
  if (input.items.length === 0) throw new Error("Add at least one invoice item");
  const calculated = calculateInvoice(input);
  if (calculated.normalizedItems.some(item => !item.description)) throw new Error("Each invoice item needs a description");
  return {
    ...calculated,
    snapshot: {
      clientId: client?.id ?? null,
      clientName,
      clientEmail: (client?.email ?? input.clientEmail?.trim()) || null,
      clientPhone: (client?.phone ?? input.clientPhone?.trim()) || null,
      clientAddress: (client?.address ?? input.clientAddress?.trim()) || null,
      billingType: input.billingType,
      dueDate: dateFromMillis(input.dueDate),
      notes: input.notes?.trim() || null,
    },
  };
}

export async function createInvoice(userId: number, input: InvoiceInput) {
  const db = await getDb();
  const client = await getOwnedClient(userId, input.clientId);
  const cleaned = cleanInvoiceInput(input, client);
  const invoiceNumber = `INV-${new Date().toISOString().slice(2, 7).replace("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
  const publicToken = await uniqueToken();

  const invoiceId = await db.transaction(async tx => {
    const created = await tx.insert(invoices).values({
      userId,
      invoiceNumber,
      publicToken,
      ...cleaned.snapshot,
      subtotalPaisa: cleaned.subtotalPaisa,
      discountPaisa: cleaned.discountPaisa,
      totalPaisa: cleaned.totalPaisa,
    });
    const id = Number(created[0].insertId);
    await tx.insert(invoiceItems).values(cleaned.normalizedItems.map(item => ({ invoiceId: id, ...item })));
    return id;
  });
  await logActivity(userId, "invoice", invoiceId, "created", `Created ${invoiceNumber} for ${cleaned.snapshot.clientName}`);
  return getInvoiceDetail(userId, invoiceId);
}

export async function getInvoiceDetail(userId: number, invoiceId: number) {
  const db = await getDb();
  const result = await db.select().from(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId))).limit(1);
  const invoice = result[0];
  if (!invoice) throw new Error("Invoice not found");
  const [items, payments] = await Promise.all([
    db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id)).orderBy(invoiceItems.sortOrder),
    db.select().from(invoicePayments).where(eq(invoicePayments.invoiceId, invoice.id)).orderBy(desc(invoicePayments.receivedAt)),
  ]);
  return { ...invoice, items, payments, outstandingPaisa: Math.max(0, invoice.totalPaisa - invoice.paidAmountPaisa) };
}

export async function updateInvoice(userId: number, invoiceId: number, input: InvoiceInput) {
  const db = await getDb();
  const existing = await getInvoiceDetail(userId, invoiceId);
  const client = await getOwnedClient(userId, input.clientId);
  const cleaned = cleanInvoiceInput(input, client);
  const paidAmountPaisa = Math.min(existing.paidAmountPaisa, cleaned.totalPaisa);
  const status = cleaned.totalPaisa > 0 && paidAmountPaisa >= cleaned.totalPaisa
    ? "paid"
    : isPastDue(cleaned.snapshot.dueDate, paidAmountPaisa, cleaned.totalPaisa)
      ? "overdue"
      : paidAmountPaisa > 0
        ? "partially_paid"
        : existing.status;

  await db.transaction(async tx => {
    await tx.update(invoices).set({
      ...cleaned.snapshot,
      subtotalPaisa: cleaned.subtotalPaisa,
      discountPaisa: cleaned.discountPaisa,
      totalPaisa: cleaned.totalPaisa,
      paidAmountPaisa,
      status,
      paidAt: status === "paid" ? new Date() : null,
    }).where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));
    await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
    await tx.insert(invoiceItems).values(cleaned.normalizedItems.map(item => ({ invoiceId, ...item })));
  });
  await logActivity(userId, "invoice", invoiceId, "updated", `Updated ${existing.invoiceNumber}`);
  return getInvoiceDetail(userId, invoiceId);
}

export async function deleteInvoice(userId: number, invoiceId: number) {
  const db = await getDb();
  const invoice = await getInvoiceDetail(userId, invoiceId);
  await db.delete(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));
  await logActivity(userId, "invoice", invoiceId, "deleted", `Deleted ${invoice.invoiceNumber}`);
  return { success: true } as const;
}

export async function refreshOverdueInvoicesForUser(userId: number) {
  const db = await getDb();
  await db.update(invoices).set({ status: "overdue" }).where(and(
    eq(invoices.userId, userId),
    inArray(invoices.status, ["sent", "viewed", "partially_paid"]),
    lt(invoices.dueDate, new Date()),
  ));
}

export async function listInvoices(userId: number) {
  const db = await getDb();
  await refreshOverdueInvoicesForUser(userId);
  const result = await db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.updatedAt));
  return result.map(invoice => ({
    ...invoice,
    outstandingPaisa: Math.max(0, invoice.totalPaisa - invoice.paidAmountPaisa),
    daysOverdue: invoice.dueDate && invoice.status === "overdue"
      ? Math.max(1, Math.ceil((Date.now() - invoice.dueDate.getTime()) / 86_400_000))
      : 0,
  }));
}

export async function updateInvoiceStatus(userId: number, invoiceId: number, status: (typeof import("../drizzle/schema").invoiceStatusValues)[number]) {
  const db = await getDb();
  const invoice = await getInvoiceDetail(userId, invoiceId);
  const paidAmountPaisa = status === "paid" ? invoice.totalPaisa : invoice.paidAmountPaisa;
  const update = {
    status,
    paidAmountPaisa,
    sentAt: status === "sent" ? new Date() : invoice.sentAt,
    viewedAt: status === "viewed" ? new Date() : invoice.viewedAt,
    paidAt: status === "paid" ? new Date() : status === "draft" ? null : invoice.paidAt,
  };
  await db.update(invoices).set(update).where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));
  await logActivity(userId, "invoice", invoiceId, "status_updated", `Marked ${invoice.invoiceNumber} as ${status.replace("_", " ")}`);
  return getInvoiceDetail(userId, invoiceId);
}

export async function addInvoicePayment(
  userId: number,
  input: { invoiceId: number; amountPaisa: number; method: "bkash" | "nagad" | "rocket" | "bank_transfer"; receivedAt?: number | null; note?: string | null },
) {
  const db = await getDb();
  const invoice = await getInvoiceDetail(userId, input.invoiceId);
  const amountPaisa = Math.round(input.amountPaisa);
  if (amountPaisa <= 0) throw new Error("Payment amount must be greater than zero");
  const paidAmountPaisa = Math.min(invoice.totalPaisa, invoice.paidAmountPaisa + amountPaisa);
  const status = paidAmountPaisa >= invoice.totalPaisa
    ? "paid"
    : isPastDue(invoice.dueDate, paidAmountPaisa, invoice.totalPaisa)
      ? "overdue"
      : "partially_paid";
  const receivedAt = dateFromMillis(input.receivedAt) ?? new Date();

  await db.transaction(async tx => {
    await tx.insert(invoicePayments).values({
      invoiceId: invoice.id,
      userId,
      amountPaisa,
      method: input.method,
      receivedAt,
      note: input.note?.trim() || null,
    });
    await tx.update(invoices).set({
      paidAmountPaisa,
      status,
      paidAt: status === "paid" ? receivedAt : null,
    }).where(eq(invoices.id, invoice.id));
  });
  await logActivity(userId, "invoice", invoice.id, "payment_recorded", `Recorded ৳${fromPaisa(amountPaisa).toLocaleString("en-BD")} payment for ${invoice.invoiceNumber}`);
  return getInvoiceDetail(userId, invoice.id);
}

export async function getDashboard(userId: number) {
  const db = await getDb();
  await refreshOverdueInvoicesForUser(userId);
  const [allInvoices, recentActivity] = await Promise.all([
    db.select().from(invoices).where(eq(invoices.userId, userId)),
    db.select().from(activityLogs).where(eq(activityLogs.userId, userId)).orderBy(desc(activityLogs.createdAt)).limit(8),
  ]);
  const totals = allInvoices.reduce((acc, invoice) => {
    acc.totalInvoices += 1;
    acc.totalPaidPaisa += invoice.paidAmountPaisa;
    acc.totalUnpaidPaisa += Math.max(0, invoice.totalPaisa - invoice.paidAmountPaisa);
    if (invoice.status === "overdue") acc.overdueCount += 1;
    return acc;
  }, { totalInvoices: 0, totalPaidPaisa: 0, totalUnpaidPaisa: 0, overdueCount: 0 });
  return { ...totals, recentActivity };
}

export async function getFollowUps(userId: number) {
  const allInvoices = await listInvoices(userId);
  return allInvoices.filter(invoice => invoice.status === "overdue" || (invoice.status !== "paid" && invoice.status !== "draft" && invoice.outstandingPaisa > 0));
}

export async function getPublicInvoice(publicToken: string) {
  const db = await getDb();
  const invoiceResult = await db.select().from(invoices).where(eq(invoices.publicToken, publicToken)).limit(1);
  const invoice = invoiceResult[0];
  if (!invoice) throw new Error("Invoice not found");
  const [profile, items] = await Promise.all([
    getProfile(invoice.userId),
    db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id)).orderBy(invoiceItems.sortOrder),
  ]);
  if (!profile) throw new Error("Freelancer profile is unavailable");
  return { invoice, items, profile };
}

export async function markPublicInvoiceViewed(publicToken: string) {
  const db = await getDb();
  const invoiceResult = await db.select().from(invoices).where(eq(invoices.publicToken, publicToken)).limit(1);
  const invoice = invoiceResult[0];
  if (!invoice) throw new Error("Invoice not found");
  await db.transaction(async tx => {
    await tx.insert(invoiceViews).values({ invoiceId: invoice.id });
    if (invoice.status === "sent") {
      await tx.update(invoices).set({ status: "viewed", viewedAt: new Date() }).where(eq(invoices.id, invoice.id));
    }
  });
  return { success: true } as const;
}

export async function getSubscription(userId: number) {
  const db = await getDb();
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionAccess(userId: number) {
  const subscription = await getSubscription(userId);
  const now = Date.now();
  const hasAccess = subscription?.status === "active"
    ? !subscription.activeUntil || subscription.activeUntil.getTime() >= now
    : subscription?.status === "trial"
      ? Boolean(subscription.trialEndsAt && subscription.trialEndsAt.getTime() >= now)
      : false;
  return { subscription, hasAccess };
}

export async function createPaymentRequest(userId: number, input: {
  planCode: "solo" | "pro";
  preferredMethod: "bkash" | "nagad" | "rocket" | "bank_transfer";
  paymentReference?: string | null;
  payerNumber?: string | null;
  userNote?: string | null;
}) {
  const db = await getDb();
  const result = await db.insert(paymentRequests).values({
    userId,
    planCode: input.planCode,
    preferredMethod: input.preferredMethod,
    paymentReference: input.paymentReference?.trim() || null,
    payerNumber: input.payerNumber?.trim() || null,
    userNote: input.userNote?.trim() || null,
  });
  const id = Number(result[0].insertId);
  await logActivity(userId, "payment_request", id, "created", `Requested ${input.planCode} activation by ${input.preferredMethod}`);
  const request = await db.select().from(paymentRequests).where(and(eq(paymentRequests.id, id), eq(paymentRequests.userId, userId))).limit(1);
  return request[0];
}

export async function listPaymentRequestsForUser(userId: number) {
  const db = await getDb();
  return db.select().from(paymentRequests).where(eq(paymentRequests.userId, userId)).orderBy(desc(paymentRequests.createdAt));
}

export async function listAdminPaymentRequests() {
  const db = await getDb();
  return db.select({ request: paymentRequests, user: users, profile: freelancerProfiles })
    .from(paymentRequests)
    .innerJoin(users, eq(paymentRequests.userId, users.id))
    .leftJoin(freelancerProfiles, eq(freelancerProfiles.userId, users.id))
    .orderBy(desc(paymentRequests.createdAt));
}

export async function reviewPaymentRequest(adminUserId: number, input: { requestId: number; status: "approved" | "rejected"; ownerNote?: string | null }) {
  const db = await getDb();
  const request = await db.select().from(paymentRequests).where(eq(paymentRequests.id, input.requestId)).limit(1);
  if (!request[0]) throw new Error("Payment request not found");
  await db.update(paymentRequests).set({
    status: input.status,
    ownerNote: input.ownerNote?.trim() || null,
    reviewedAt: new Date(),
    reviewedByUserId: adminUserId,
  }).where(eq(paymentRequests.id, input.requestId));
  await logActivity(request[0].userId, "payment_request", request[0].id, input.status, `Payment request ${input.status} by platform owner`);
  return { success: true } as const;
}

export async function getPlatformSettings() {
  const db = await getDb();
  const result = await db.select().from(platformSettings).where(eq(platformSettings.id, 1)).limit(1);
  return result[0] ?? null;
}

export async function savePlatformSettings(adminUserId: number, input: {
  bkashNumber?: string | null;
  nagadNumber?: string | null;
  rocketNumber?: string | null;
  bankTransferInstructions?: string | null;
  supportEmail?: string | null;
  supportWhatsApp?: string | null;
}) {
  const db = await getDb();
  const values = {
    id: 1,
    bkashNumber: input.bkashNumber?.trim() || null,
    nagadNumber: input.nagadNumber?.trim() || null,
    rocketNumber: input.rocketNumber?.trim() || null,
    bankTransferInstructions: input.bankTransferInstructions?.trim() || null,
    supportEmail: input.supportEmail?.trim() || null,
    supportWhatsApp: input.supportWhatsApp?.trim() || null,
    updatedByUserId: adminUserId,
  };
  await db.insert(platformSettings).values(values).onDuplicateKeyUpdate({
    set: { ...values, id: undefined },
  });
  return getPlatformSettings();
}

export async function listAdminUsers() {
  const db = await getDb();
  const result = await db
    .select({ user: users, subscription: subscriptions, profile: freelancerProfiles })
    .from(users)
    .leftJoin(subscriptions, eq(subscriptions.userId, users.id))
    .leftJoin(freelancerProfiles, eq(freelancerProfiles.userId, users.id))
    .orderBy(desc(users.createdAt));
  return result;
}

export async function updateSubscription(
  adminUserId: number,
  input: {
    userId: number;
    status: "inactive" | "trial" | "active" | "expired";
    planCode?: "solo" | "pro";
    trialEndsAt?: number | null;
    activeUntil?: number | null;
    lastPaymentMethod?: "bkash" | "nagad" | "rocket" | "bank_transfer" | null;
    ownerNote?: string | null;
  },
) {
  const db = await getDb();
  const values = {
    userId: input.userId,
    status: input.status,
    planCode: input.planCode ?? "solo",
    trialEndsAt: dateFromMillis(input.trialEndsAt),
    activeUntil: dateFromMillis(input.activeUntil),
    lastPaymentMethod: input.lastPaymentMethod ?? null,
    ownerNote: input.ownerNote?.trim() || null,
    updatedByUserId: adminUserId,
  };
  await db.insert(subscriptions).values(values).onDuplicateKeyUpdate({
    set: {
      status: values.status,
      planCode: values.planCode,
      trialEndsAt: values.trialEndsAt,
      activeUntil: values.activeUntil,
      lastPaymentMethod: values.lastPaymentMethod,
      ownerNote: values.ownerNote,
      updatedByUserId: adminUserId,
    },
  });
  await logActivity(input.userId, "subscription", null, "subscription_updated", `Subscription marked ${input.status} by platform owner`);
  return getSubscription(input.userId);
}
