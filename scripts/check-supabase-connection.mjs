import postgres from "postgres";

const connectionString = process.env.INVOICEPRO_DATABASE_URL;
if (!connectionString) throw new Error("INVOICEPRO_DATABASE_URL is required");

const sql = postgres(connectionString, { max: 1, prepare: false });
try {
  const [result] = await sql`select current_database() as database_name, current_user as database_user`;
  console.log(JSON.stringify(result));
} finally {
  await sql.end({ timeout: 5 });
}
