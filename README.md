# InvoicePro

> **Mobile-first BDT invoicing and payment follow-up for Bangladeshi freelancers and small agencies.**

InvoicePro helps a freelancer create clear BDT invoices, share a client-safe public link, include their preferred bKash, Nagad, Rocket, or bank transfer instructions, and keep unpaid work visible until it is settled.

## Product scope

| Area | Included capability |
|---|---|
| Freelancer profile | Business name, contact information, optional managed logo upload, and local payment instructions |
| Client workspace | Create, edit, delete, search, and reuse client records |
| BDT invoices | Fixed-price and itemized invoices, discounts, due dates, notes, and automatic paisa-safe totals |
| Payment workflow | Draft, Sent, Viewed, Partially paid, Paid, and Overdue statuses; manual payment records |
| Public invoice links | Unique non-guessable links that clients can view without creating an account |
| Sharing | One-tap WhatsApp and email message copying containing the public invoice link |
| Follow-ups | Outstanding and overdue invoice queue with overdue-day indicators and reminder copy |
| Owner administration | Manual local-payment subscription activation and extension for registered users |

## Technology

The application is built with **React 19**, **TypeScript**, **Tailwind CSS 4**, **Express**, **tRPC**, **Drizzle ORM**, and **MySQL/TiDB**. Authentication, managed S3-compatible storage, and the database connection are supplied by the Manus full-stack environment.

## Local development

```bash
pnpm install
pnpm dev
```

The full-stack environment requires these variables, which are automatically provided in a Manus project:

```text
DATABASE_URL
JWT_SECRET
VITE_APP_ID
OAUTH_SERVER_URL
VITE_OAUTH_PORTAL_URL
BUILT_IN_FORGE_API_URL
BUILT_IN_FORGE_API_KEY
```

## Database workflow

The current schema is defined in `drizzle/schema.ts`, and the initial migration is stored in `drizzle/0001_amused_lizard.sql`.

When changing the schema, generate a new migration, review it, and apply it to the target database before deploying code that expects the change.

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## Verification

```bash
pnpm check
pnpm test
pnpm build
```

The automated test suite covers BDT calculations, overdue detection, logout, public-token access, subscription permissions, client filtering, and managed logo upload validation.

## Manual subscriptions

InvoicePro intentionally does **not** automate payment collection. The platform owner confirms a customer’s bKash, Nagad, Rocket, or bank transfer payment offline and then uses the owner-only admin screen to activate or extend that user’s access.

## Pilot workflow

See [`pilot-workflow.md`](./pilot-workflow.md) for the recommended three-to-five-user controlled pilot and the exact workflow to test before a broader release.

## Legacy boundary

This is a clean full-stack rebuild of the original InvoicePro project. It does not automatically import invoices, user records, or data from the legacy Supabase database. Keep the legacy project and its backup branch until any separately planned data migration has been completed and verified.
