import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const invoiceStatusValues = [
  "draft",
  "sent",
  "viewed",
  "partially_paid",
  "paid",
  "overdue",
] as const;

export const paymentMethodValues = ["bkash", "nagad", "rocket", "bank_transfer"] as const;

export const freelancerProfiles = mysqlTable(
  "freelancerProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    businessName: varchar("businessName", { length: 160 }).notNull(),
    logoUrl: text("logoUrl"),
    phone: varchar("phone", { length: 40 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    bkashNumber: varchar("bkashNumber", { length: 40 }),
    nagadNumber: varchar("nagadNumber", { length: 40 }),
    rocketNumber: varchar("rocketNumber", { length: 40 }),
    bankTransferInstructions: text("bankTransferInstructions"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("freelancer_profiles_user_id_unique").on(table.userId)],
);

export const clients = mysqlTable(
  "clients",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    address: text("address"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("clients_user_id_name_index").on(table.userId, table.name)],
);

export const invoices = mysqlTable(
  "invoices",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientId: int("clientId").references(() => clients.id, { onDelete: "set null" }),
    invoiceNumber: varchar("invoiceNumber", { length: 40 }).notNull(),
    publicToken: varchar("publicToken", { length: 64 }).notNull(),
    clientName: varchar("clientName", { length: 160 }).notNull(),
    clientEmail: varchar("clientEmail", { length: 320 }),
    clientPhone: varchar("clientPhone", { length: 40 }),
    clientAddress: text("clientAddress"),
    billingType: mysqlEnum("billingType", ["fixed_price", "itemized"]).default("itemized").notNull(),
    issueDate: timestamp("issueDate").defaultNow().notNull(),
    dueDate: timestamp("dueDate"),
    status: mysqlEnum("status", invoiceStatusValues).default("draft").notNull(),
    subtotalPaisa: int("subtotalPaisa").notNull().default(0),
    discountPaisa: int("discountPaisa").notNull().default(0),
    totalPaisa: int("totalPaisa").notNull().default(0),
    paidAmountPaisa: int("paidAmountPaisa").notNull().default(0),
    notes: text("notes"),
    sentAt: timestamp("sentAt"),
    viewedAt: timestamp("viewedAt"),
    paidAt: timestamp("paidAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("invoices_user_number_unique").on(table.userId, table.invoiceNumber),
    uniqueIndex("invoices_public_token_unique").on(table.publicToken),
    index("invoices_user_status_due_index").on(table.userId, table.status, table.dueDate),
  ],
);

export const invoiceItems = mysqlTable(
  "invoiceItems",
  {
    id: int("id").autoincrement().primaryKey(),
    invoiceId: int("invoiceId")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: varchar("description", { length: 300 }).notNull(),
    quantityHundredths: int("quantityHundredths").notNull().default(100),
    unitAmountPaisa: int("unitAmountPaisa").notNull(),
    lineTotalPaisa: int("lineTotalPaisa").notNull(),
    sortOrder: int("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("invoice_items_invoice_id_index").on(table.invoiceId)],
);

export const invoicePayments = mysqlTable(
  "invoicePayments",
  {
    id: int("id").autoincrement().primaryKey(),
    invoiceId: int("invoiceId")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amountPaisa: int("amountPaisa").notNull(),
    method: mysqlEnum("method", paymentMethodValues).notNull(),
    receivedAt: timestamp("receivedAt").defaultNow().notNull(),
    note: text("note"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("invoice_payments_invoice_id_index").on(table.invoiceId)],
);

export const invoiceViews = mysqlTable(
  "invoiceViews",
  {
    id: int("id").autoincrement().primaryKey(),
    invoiceId: int("invoiceId")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  },
  table => [index("invoice_views_invoice_id_index").on(table.invoiceId)],
);

export const activityLogs = mysqlTable(
  "activityLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: varchar("entityType", { length: 40 }).notNull(),
    entityId: int("entityId"),
    action: varchar("action", { length: 120 }).notNull(),
    detail: text("detail"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("activity_logs_user_created_index").on(table.userId, table.createdAt)],
);

export const subscriptions = mysqlTable(
  "subscriptions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["inactive", "active", "expired"]).default("inactive").notNull(),
    activeUntil: timestamp("activeUntil"),
    lastPaymentMethod: mysqlEnum("lastPaymentMethod", paymentMethodValues),
    ownerNote: text("ownerNote"),
    updatedByUserId: int("updatedByUserId").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("subscriptions_user_id_unique").on(table.userId)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
