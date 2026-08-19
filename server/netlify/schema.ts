import { index, integer, pgSchema, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const invoicepro = pgSchema("invoicepro");

export const userRoleEnum = invoicepro.enum("user_role", ["admin", "user"]);
export const invoiceStatusValues = ["draft", "sent", "viewed", "partially_paid", "paid", "overdue"] as const;
export const paymentMethodValues = ["bkash", "nagad", "rocket", "bank_transfer"] as const;
export const paymentRequestStatusValues = ["pending", "approved", "rejected"] as const;

const now = () => timestamp("createdAt", { withTimezone: true }).defaultNow().notNull();

export const users = invoicepro.table("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").notNull().default("user"),
  customerSessionVersion: integer("customerSessionVersion").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export const customerCredentials = invoicepro.table("customerCredentials", {
  userId: integer("userId").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  passwordUpdatedAt: timestamp("passwordUpdatedAt", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export const freelancerProfiles = invoicepro.table("freelancerProfiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: varchar("businessName", { length: 160 }).notNull(),
  logoUrl: text("logoUrl"),
  phone: varchar("phone", { length: 40 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  bkashNumber: varchar("bkashNumber", { length: 40 }),
  nagadNumber: varchar("nagadNumber", { length: 40 }),
  rocketNumber: varchar("rocketNumber", { length: 40 }),
  bankTransferInstructions: text("bankTransferInstructions"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
}, table => [uniqueIndex("freelancer_profiles_user_id_unique").on(table.userId)]);

export const clients = invoicepro.table("clients", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
}, table => [index("clients_user_id_name_index").on(table.userId, table.name)]);

export const invoices = invoicepro.table("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: integer("clientId").references(() => clients.id, { onDelete: "set null" }),
  invoiceNumber: varchar("invoiceNumber", { length: 40 }).notNull(),
  publicToken: varchar("publicToken", { length: 64 }).notNull(),
  clientName: varchar("clientName", { length: 160 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }),
  clientPhone: varchar("clientPhone", { length: 40 }),
  clientAddress: text("clientAddress"),
  billingType: varchar("billingType", { length: 16 }).notNull().default("itemized"),
  issueDate: timestamp("issueDate", { withTimezone: true }).defaultNow().notNull(),
  dueDate: timestamp("dueDate", { withTimezone: true }),
  status: varchar("status", { length: 24 }).notNull().default("draft"),
  subtotalPaisa: integer("subtotalPaisa").notNull().default(0),
  discountPaisa: integer("discountPaisa").notNull().default(0),
  totalPaisa: integer("totalPaisa").notNull().default(0),
  paidAmountPaisa: integer("paidAmountPaisa").notNull().default(0),
  notes: text("notes"),
  sentAt: timestamp("sentAt", { withTimezone: true }),
  viewedAt: timestamp("viewedAt", { withTimezone: true }),
  paidAt: timestamp("paidAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
}, table => [uniqueIndex("invoices_user_number_unique").on(table.userId, table.invoiceNumber), uniqueIndex("invoices_public_token_unique").on(table.publicToken), index("invoices_user_status_due_index").on(table.userId, table.status, table.dueDate)]);

export const invoiceItems = invoicepro.table("invoiceItems", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoiceId").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: varchar("description", { length: 300 }).notNull(),
  quantityHundredths: integer("quantityHundredths").notNull().default(100),
  unitAmountPaisa: integer("unitAmountPaisa").notNull(),
  lineTotalPaisa: integer("lineTotalPaisa").notNull(),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, table => [index("invoice_items_invoice_id_index").on(table.invoiceId)]);

export const invoicePayments = invoicepro.table("invoicePayments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoiceId").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  amountPaisa: integer("amountPaisa").notNull(),
  method: varchar("method", { length: 24 }).notNull(),
  receivedAt: timestamp("receivedAt", { withTimezone: true }).defaultNow().notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, table => [index("invoice_payments_invoice_id_index").on(table.invoiceId)]);

export const invoiceViews = invoicepro.table("invoiceViews", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoiceId").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  viewedAt: timestamp("viewedAt", { withTimezone: true }).defaultNow().notNull(),
}, table => [index("invoice_views_invoice_id_index").on(table.invoiceId)]);

export const activityLogs = invoicepro.table("activityLogs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  entityType: varchar("entityType", { length: 40 }).notNull(),
  entityId: integer("entityId"),
  action: varchar("action", { length: 120 }).notNull(),
  detail: text("detail"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
}, table => [index("activity_logs_user_created_index").on(table.userId, table.createdAt)]);

export const subscriptions = invoicepro.table("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 16 }).notNull().default("inactive"),
  planCode: varchar("planCode", { length: 16 }).notNull().default("solo"),
  trialEndsAt: timestamp("trialEndsAt", { withTimezone: true }),
  activeUntil: timestamp("activeUntil", { withTimezone: true }),
  lastPaymentMethod: varchar("lastPaymentMethod", { length: 24 }),
  ownerNote: text("ownerNote"),
  updatedByUserId: integer("updatedByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
}, table => [uniqueIndex("subscriptions_user_id_unique").on(table.userId)]);

export const paymentRequests = invoicepro.table("paymentRequests", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  planCode: varchar("planCode", { length: 16 }).notNull().default("solo"),
  preferredMethod: varchar("preferredMethod", { length: 24 }).notNull(),
  paymentReference: varchar("paymentReference", { length: 160 }),
  payerNumber: varchar("payerNumber", { length: 40 }),
  userNote: text("userNote"),
  status: varchar("status", { length: 16 }).notNull().default("pending"),
  ownerNote: text("ownerNote"),
  reviewedAt: timestamp("reviewedAt", { withTimezone: true }),
  reviewedByUserId: integer("reviewedByUserId").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
}, table => [index("payment_requests_user_created_index").on(table.userId, table.createdAt), index("payment_requests_status_created_index").on(table.status, table.createdAt)]);

export const platformSettings = invoicepro.table("platformSettings", {
  id: integer("id").primaryKey(),
  bkashNumber: varchar("bkashNumber", { length: 40 }),
  nagadNumber: varchar("nagadNumber", { length: 40 }),
  rocketNumber: varchar("rocketNumber", { length: 40 }),
  bankTransferInstructions: text("bankTransferInstructions"),
  supportEmail: varchar("supportEmail", { length: 320 }),
  supportWhatsApp: varchar("supportWhatsApp", { length: 40 }),
  updatedByUserId: integer("updatedByUserId").references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
