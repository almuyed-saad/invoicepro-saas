# InvoicePro

> **Mobile-first BDT invoicing, payment follow-up, and manual local-subscription management for Bangladeshi freelancers and small agencies.**

InvoicePro helps independent professionals create clear invoices in Bangladeshi Taka (BDT), share a secure public invoice link with a client, show familiar local payment instructions, and track unpaid work until it is settled.

## Live links

| Resource | Link | Access |
|---|---|---|
| **Live InvoicePro app** | [invoice-pro-saas.netlify.app](https://invoice-pro-saas.netlify.app) | Public; customers create their own accounts. |
| **GitHub source repository** | [almuyed-saad/invoicepro-saas](https://github.com/almuyed-saad/invoicepro-saas) | Source code and project history. |
| **Supabase database dashboard** | [Invoice generator project](https://supabase.com/dashboard/project/ujuxxvxfacmpnxlgbxqg) | Owner-only; requires the project owner’s Supabase login. |
| **Netlify deployment dashboard** | [invoice-pro-saas deploys](https://app.netlify.com/projects/invoice-pro-saas/deploys) | Owner-only; requires the project owner’s Netlify login. |

> **Important:** Never place database passwords, Netlify secrets, JWT keys, or owner passwords in GitHub issues, commits, screenshots, or client-facing messages.

## What customers can do

| Area | Included capability |
|---|---|
| **Account access** | Customer registration and sign-in with password-protected sessions, plus a 14-day free trial. |
| **Business profile** | Business name, contact details, logo upload, and bKash, Nagad, Rocket, and bank-transfer instructions. |
| **Client workspace** | Create, edit, search, reuse, and delete client records. |
| **BDT invoices** | Fixed-price and itemized invoices, due dates, discounts, notes, and automatic paisa-safe totals. |
| **Invoice lifecycle** | Draft, Sent, Viewed, Partially Paid, Paid, and Overdue statuses, including manual payment recording. |
| **Client sharing** | Public, non-guessable invoice links with direct email, WhatsApp, copy-link, and copy-message actions. |
| **Follow-ups** | A queue for unpaid and overdue invoices with overdue-day indicators and ready-to-share reminder copy. |
| **Subscriptions** | Solo at **৳500/month** and Pro at **৳1,000/month**, activated manually after a local payment is confirmed. |
| **Owner administration** | Review payment requests, activate or extend subscriptions, and manage platform payment/support details. |

## How the payment model works

InvoicePro intentionally does **not** charge cards or process automated recurring payments. Customers request a subscription plan, pay the owner through a local method, and the owner confirms the payment in the owner-only admin area.

| Method | Current instruction |
|---|---|
| bKash | `01612075236` |
| Nagad | `01612075236` |
| Rocket | `01612075236` |
| WhatsApp support | `8801612075236` |
| Support email | `contact.almuyedsaad@gmail.com` |

This manual confirmation model is deliberate: it supports Bangladesh-based selling without requiring the owner to have an international card payment gateway.

## Technology and architecture

| Layer | Implementation |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Wouter, TanStack Query, shadcn/ui components. |
| API | Express 4 and tRPC 11, packaged as a Netlify Function with `serverless-http`. |
| Database | PostgreSQL on Supabase, isolated in the `invoicepro` schema of the **Invoice generator** project. |
| Data access | Drizzle ORM with `postgres-js`. |
| Authentication | Customer email/password sessions using scrypt password hashing and signed HTTP-only cookies. |
| File storage | Netlify Blobs for managed logo assets. |
| Production hosting | Netlify static hosting and Netlify Functions. |

The `invoicepro` schema is separate from any other Supabase project. In particular, the owner’s **my-blog** project is not used or modified by InvoicePro.

## Repository map

```text
client/                         React application
  src/pages/                    Workspace, invoice, onboarding, pricing, and admin pages
  src/components/               Layout and reusable UI components
server/netlify/                 Production Netlify API, database helpers, and schema
netlify/functions/api.ts        Netlify Function entry point
shared/                         Shared BDT calculation and sharing utilities
release-audit.md                Release validation scope and known limitations
todo.md                         Project history and open operational items
netlify.toml                    Netlify build, function, and routing configuration
```

## Local development

### Prerequisites

Use Node.js 22+ and pnpm. Production credentials must be supplied through secure environment settings; do **not** commit a `.env` file.

```bash
pnpm install
pnpm test
pnpm check
pnpm build:netlify
```

For the Manus development environment:

```bash
pnpm dev
```

### Required production environment variables

Configure these in Netlify rather than in source code:

```text
INVOICEPRO_DATABASE_URL
JWT_SECRET
INVOICEPRO_OWNER_PASSWORD
```

The owner password and database connection string are **secrets**. They should only exist in the secure Netlify environment-variable settings.

## Database ownership and safe administration

The Supabase project is owner-controlled. Use the [Supabase dashboard](https://supabase.com/dashboard/project/ujuxxvxfacmpnxlgbxqg) to inspect database health, tables, usage, backups, and access settings.

Before changing rows manually, create a backup or export. Direct edits can affect customer sign-in, invoices, payments, activity records, and subscriptions. Prefer the InvoicePro workspace and owner-admin interface for normal operating tasks.

## Quality checks

The current source includes **31 automated tests** covering invoice calculations, public-link behavior, customer authentication, protected-route handling, subscription permissions, payment-request review, logo validation, sharing controls, sidebar accessibility, and production public-invoice error handling.

Run the project checks with:

```bash
pnpm test
pnpm check
pnpm build:netlify
```

## Deployment and operating status

The currently published production site remains available at [invoice-pro-saas.netlify.app](https://invoice-pro-saas.netlify.app). Netlify publishes from the `main` branch automatically when the hosting account has deployment capacity.

At the time of this documentation update, the Netlify account has paused new production deployments because its available deployment credits are exhausted. This **does not take the already-published site offline**. It does mean that newer commits in `main` may wait until deployments are resumed through Netlify. Check the [Netlify deploy dashboard](https://app.netlify.com/projects/invoice-pro-saas/deploys) for the authoritative live revision and deployment state.

## Known product limitations

| Limitation | Current behavior |
|---|---|
| Email delivery | **Email invoice** opens a prepared `mailto:` draft in the user’s configured mail app. InvoicePro does not send or track transactional email itself. |
| WhatsApp delivery | The app opens a prepared WhatsApp message; it does not send messages automatically. |
| Payment reconciliation | bKash, Nagad, Rocket, and bank payments are confirmed manually by the owner. |
| PDF export | Invoice PDF export is not currently included. |
| Password reset | A self-service password-reset flow is not currently included. |
| Deployment capacity | Netlify account capacity must be available to publish future GitHub commits. |

## Owner operating checklist

1. Monitor customer payment requests from **Owner admin** in the live workspace.
2. Confirm local bKash, Nagad, Rocket, or bank payments outside the app.
3. Activate or extend the customer subscription in **Owner admin**.
4. Keep the payment number, support email, and WhatsApp details accurate in platform settings.
5. Check the Supabase and Netlify dashboards regularly for database health and deployment status.
6. Before any database or production configuration change, make a backup and record what changed.

## Support

For InvoicePro account, subscription, or payment questions, contact **Almuyed Saad** at [contact.almuyedsaad@gmail.com](mailto:contact.almuyedsaad@gmail.com) or WhatsApp at `8801612075236`.

---

Built for freelancers in Bangladesh who want to invoice clearly, follow up confidently, and get paid locally in BDT.
