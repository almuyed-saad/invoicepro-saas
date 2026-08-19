import postgres from "postgres";

const connectionString = process.env.INVOICEPRO_DATABASE_URL;
if (!connectionString) throw new Error("INVOICEPRO_DATABASE_URL is required");

const sql = postgres(connectionString, { max: 1, prepare: false });
try {
  const rows = await sql`
    select u.id, u.email, u.role, u."loginMethod", (c."userId" is not null) as has_password_credential
    from invoicepro."users" u
    left join invoicepro."customerCredentials" c on c."userId" = u.id
    where u.email = 'contact.almuyedsaad@gmail.com'
  `;
  console.log(JSON.stringify(rows));
} finally {
  await sql.end({ timeout: 5 });
}
