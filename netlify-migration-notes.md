# Existing Netlify Migration Notes

## Verified hosting state

The established public site is `https://invoice-pro-saas.netlify.app/` (Netlify site ID `ece5c2d8-1562-4700-a492-416423bc503e`). It currently returns a Netlify 404. The preserved legacy branch includes a static-site `netlify.toml`; the rebuilt `main` branch contains no Netlify configuration and is a full-stack Node/Express application rather than a static site.

## Verified database state

The legacy Supabase project, **Invoice generator** (`ujuxxvxfacmpnxlgbxqg`), is accessible in the owner’s browser after sign-in. Its status remains **Coming up**, with the project URL unavailable while the restart completes. The primary database is shown as PostgreSQL in the Tokyo region. This project uses PostgreSQL, whereas the rebuilt InvoicePro source currently uses Drizzle’s MySQL adapter.

The database schema visualizer subsequently loaded the legacy tables, confirming that the PostgreSQL database is operational despite the project-overview status display. The project’s **Connect** panel is available, including a direct connection-string option required for configuring the Netlify server functions.

Within the Connect panel, the **Transaction pooler** mode was selected. Supabase identifies this mode as suitable for stateless serverless functions, matching the target Netlify runtime.

The connection panel is currently configured to display a URI, but the actual generated URI and the database password have not yet been retrieved. Both are required to set the production `DATABASE_URL` securely in Netlify.

## Isolation check

The Supabase organization also contains a separate project named **my-blog** (`sokhvipepnxapldbzynz`), which is undergoing its own restoration. No action was taken against that project. Supabase projects have separate databases and separate database passwords; the InvoicePro project remains **Invoice generator** (`ujuxxvxfacmpnxlgbxqg`).

The user authorized rotation of the database password for the separate **Invoice generator** project only. A strong password was generated in the Supabase reset form and will be stored only in the target production environment; the credential is not recorded in this repository or documentation.

Supabase confirmed that the **Invoice generator** database password update succeeded. No action was taken against the separate **my-blog** project.

## Implementation references

Netlify documents that existing Express applications can run behind a Function using `serverless-http` with a rewrite from `/api/*` to the function path. The same documentation confirms that Functions impose serverless execution constraints. Netlify’s Functions documentation describes the Request/Context/Response model and its Blob storage API. Sources: <https://docs.netlify.com/build/frameworks/framework-setup-guides/express/> and <https://docs.netlify.com/build/functions/overview/>.

The separate Invoice generator project’s SQL Editor is open and ready to apply `netlify/supabase-schema.sql`. The migration uses only `CREATE SCHEMA`, `CREATE TYPE`, `CREATE TABLE IF NOT EXISTS`, and `CREATE INDEX IF NOT EXISTS` statements under the `invoicepro` schema; it does not drop, rename, or alter legacy public tables.

The SQL text was pasted into the editor, but the initial Run control returned `query: Too small: expected string to have >=1 characters`. The editor retained the visible text and Supabase did not report any successful DDL statements, so no migration objects should be assumed to have been created. A different editor execution method is required.

The Supabase transaction-pooler connection was subsequently validated by a local PostgreSQL client, and the reviewed `invoicepro` migration was applied through that connection. The runner reported **24 statements** and **12 tables** in the isolated `invoicepro` schema. The existing Netlify site now has a secret `INVOICEPRO_DATABASE_URL` configured for the transaction-pooler connection. Credential values are intentionally not recorded here.

Netlify’s variable form requires `JWT_SECRET` to be explicitly marked as a secret before it can be created. The generated session-signing value is present only in the active form and must not be retained in project files.

The `JWT_SECRET` form has been marked secret and Netlify applies the protected value to production, Deploy Preview, and branch-deploy contexts. The value remains absent from project files and migration notes.

The generated initial owner credential has been placed in Netlify’s environment-variable import form and marked secret. It has not been written to the repository or migration notes.

## Migration boundary

Do not deploy only the frontend to Netlify: that would make the interface visible while customer login, sessions, invoices, and database calls fail. The migration must provide a Netlify-compatible API layer, a production PostgreSQL adapter/schema, and production environment configuration before the existing URL is switched to the rebuilt application.
