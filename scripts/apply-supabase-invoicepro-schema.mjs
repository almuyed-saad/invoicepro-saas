import { readFile } from "node:fs/promises";
import postgres from "postgres";

const connectionString = process.env.INVOICEPRO_DATABASE_URL;
if (!connectionString) throw new Error("INVOICEPRO_DATABASE_URL is required");

const migration = await readFile(new URL("../netlify/supabase-schema.sql", import.meta.url), "utf8");
const statements = migration
  .split(/;\s*(?:\r?\n|$)/)
  .map(statement => statement.trim())
  .filter(Boolean);

const sql = postgres(connectionString, { max: 1, prepare: false });
try {
  for (const statement of statements) {
    await sql.unsafe(statement);
  }
  const [{ table_count }] = await sql`
    select count(*)::int as table_count
    from information_schema.tables
    where table_schema = 'invoicepro'
  `;
  console.log(JSON.stringify({ appliedStatements: statements.length, invoiceproTableCount: table_count }));
} finally {
  await sql.end({ timeout: 5 });
}
