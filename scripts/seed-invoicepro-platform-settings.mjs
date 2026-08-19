import postgres from "postgres";

const connectionString = process.env.INVOICEPRO_DATABASE_URL;
if (!connectionString) throw new Error("INVOICEPRO_DATABASE_URL is required");

const sql = postgres(connectionString, { max: 1, prepare: false });
try {
  await sql`
    insert into invoicepro."platformSettings" (
      "id", "bkashNumber", "nagadNumber", "rocketNumber", "bankTransferInstructions",
      "supportEmail", "supportWhatsApp", "updatedByUserId", "updatedAt"
    ) values (
      1, '01612075236', '01612075236', '01612075236', null,
      'contact.almuyedsaad@gmail.com', '8801612075236', 1, now()
    )
    on conflict ("id") do update set
      "bkashNumber" = excluded."bkashNumber",
      "nagadNumber" = excluded."nagadNumber",
      "rocketNumber" = excluded."rocketNumber",
      "bankTransferInstructions" = excluded."bankTransferInstructions",
      "supportEmail" = excluded."supportEmail",
      "supportWhatsApp" = excluded."supportWhatsApp",
      "updatedByUserId" = excluded."updatedByUserId",
      "updatedAt" = excluded."updatedAt"
  `;

  const [settings] = await sql`
    select "bkashNumber", "nagadNumber", "rocketNumber", "supportEmail", "supportWhatsApp"
    from invoicepro."platformSettings"
    where "id" = 1
  `;
  console.log(JSON.stringify(settings));
} finally {
  await sql.end({ timeout: 5 });
}
