BEGIN;

CREATE SCHEMA IF NOT EXISTS invoicepro;
CREATE TYPE invoicepro.user_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS invoicepro."users" (
  "id" SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  "name" TEXT,
  "email" VARCHAR(320) UNIQUE,
  "loginMethod" VARCHAR(64),
  "role" invoicepro.user_role NOT NULL DEFAULT 'user',
  "customerSessionVersion" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoicepro."customerCredentials" (
  "userId" INTEGER PRIMARY KEY REFERENCES invoicepro."users"("id") ON DELETE CASCADE,
  "passwordHash" VARCHAR(255) NOT NULL,
  "passwordUpdatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoicepro."freelancerProfiles" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE REFERENCES invoicepro."users"("id") ON DELETE CASCADE,
  "businessName" VARCHAR(160) NOT NULL,
  "logoUrl" TEXT,
  "phone" VARCHAR(40) NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "bkashNumber" VARCHAR(40),
  "nagadNumber" VARCHAR(40),
  "rocketNumber" VARCHAR(40),
  "bankTransferInstructions" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoicepro."clients" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES invoicepro."users"("id") ON DELETE CASCADE,
  "name" VARCHAR(160) NOT NULL,
  "email" VARCHAR(320),
  "phone" VARCHAR(40),
  "address" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS clients_user_id_name_index ON invoicepro."clients" ("userId", "name");

CREATE TABLE IF NOT EXISTS invoicepro."invoices" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES invoicepro."users"("id") ON DELETE CASCADE,
  "clientId" INTEGER REFERENCES invoicepro."clients"("id") ON DELETE SET NULL,
  "invoiceNumber" VARCHAR(40) NOT NULL,
  "publicToken" VARCHAR(64) NOT NULL UNIQUE,
  "clientName" VARCHAR(160) NOT NULL,
  "clientEmail" VARCHAR(320),
  "clientPhone" VARCHAR(40),
  "clientAddress" TEXT,
  "billingType" VARCHAR(16) NOT NULL DEFAULT 'itemized',
  "issueDate" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "dueDate" TIMESTAMPTZ,
  "status" VARCHAR(24) NOT NULL DEFAULT 'draft',
  "subtotalPaisa" INTEGER NOT NULL DEFAULT 0,
  "discountPaisa" INTEGER NOT NULL DEFAULT 0,
  "totalPaisa" INTEGER NOT NULL DEFAULT 0,
  "paidAmountPaisa" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "sentAt" TIMESTAMPTZ,
  "viewedAt" TIMESTAMPTZ,
  "paidAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "invoiceNumber")
);
CREATE INDEX IF NOT EXISTS invoices_user_status_due_index ON invoicepro."invoices" ("userId", "status", "dueDate");

CREATE TABLE IF NOT EXISTS invoicepro."invoiceItems" (
  "id" SERIAL PRIMARY KEY,
  "invoiceId" INTEGER NOT NULL REFERENCES invoicepro."invoices"("id") ON DELETE CASCADE,
  "description" VARCHAR(300) NOT NULL,
  "quantityHundredths" INTEGER NOT NULL DEFAULT 100,
  "unitAmountPaisa" INTEGER NOT NULL,
  "lineTotalPaisa" INTEGER NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_index ON invoicepro."invoiceItems" ("invoiceId");

CREATE TABLE IF NOT EXISTS invoicepro."invoicePayments" (
  "id" SERIAL PRIMARY KEY,
  "invoiceId" INTEGER NOT NULL REFERENCES invoicepro."invoices"("id") ON DELETE CASCADE,
  "userId" INTEGER NOT NULL REFERENCES invoicepro."users"("id") ON DELETE CASCADE,
  "amountPaisa" INTEGER NOT NULL,
  "method" VARCHAR(24) NOT NULL,
  "receivedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "note" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS invoice_payments_invoice_id_index ON invoicepro."invoicePayments" ("invoiceId");

CREATE TABLE IF NOT EXISTS invoicepro."invoiceViews" (
  "id" SERIAL PRIMARY KEY,
  "invoiceId" INTEGER NOT NULL REFERENCES invoicepro."invoices"("id") ON DELETE CASCADE,
  "viewedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS invoice_views_invoice_id_index ON invoicepro."invoiceViews" ("invoiceId");

CREATE TABLE IF NOT EXISTS invoicepro."activityLogs" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES invoicepro."users"("id") ON DELETE CASCADE,
  "entityType" VARCHAR(40) NOT NULL,
  "entityId" INTEGER,
  "action" VARCHAR(120) NOT NULL,
  "detail" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activity_logs_user_created_index ON invoicepro."activityLogs" ("userId", "createdAt");

CREATE TABLE IF NOT EXISTS invoicepro."subscriptions" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE REFERENCES invoicepro."users"("id") ON DELETE CASCADE,
  "status" VARCHAR(16) NOT NULL DEFAULT 'inactive',
  "planCode" VARCHAR(16) NOT NULL DEFAULT 'solo',
  "trialEndsAt" TIMESTAMPTZ,
  "activeUntil" TIMESTAMPTZ,
  "lastPaymentMethod" VARCHAR(24),
  "ownerNote" TEXT,
  "updatedByUserId" INTEGER REFERENCES invoicepro."users"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoicepro."paymentRequests" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES invoicepro."users"("id") ON DELETE CASCADE,
  "planCode" VARCHAR(16) NOT NULL DEFAULT 'solo',
  "preferredMethod" VARCHAR(24) NOT NULL,
  "paymentReference" VARCHAR(160),
  "payerNumber" VARCHAR(40),
  "userNote" TEXT,
  "status" VARCHAR(16) NOT NULL DEFAULT 'pending',
  "ownerNote" TEXT,
  "reviewedAt" TIMESTAMPTZ,
  "reviewedByUserId" INTEGER REFERENCES invoicepro."users"("id") ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS payment_requests_user_created_index ON invoicepro."paymentRequests" ("userId", "createdAt");
CREATE INDEX IF NOT EXISTS payment_requests_status_created_index ON invoicepro."paymentRequests" ("status", "createdAt");

CREATE TABLE IF NOT EXISTS invoicepro."platformSettings" (
  "id" INTEGER PRIMARY KEY,
  "bkashNumber" VARCHAR(40),
  "nagadNumber" VARCHAR(40),
  "rocketNumber" VARCHAR(40),
  "bankTransferInstructions" TEXT,
  "supportEmail" VARCHAR(320),
  "supportWhatsApp" VARCHAR(40),
  "updatedByUserId" INTEGER REFERENCES invoicepro."users"("id") ON DELETE SET NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
