import { hashCustomerPassword } from "../server/netlify/customerAuth.ts";
import { createOwnerAccount } from "../server/netlify/db.pg.ts";

const connectionString = process.env.INVOICEPRO_DATABASE_URL;
const password = process.env.INVOICEPRO_OWNER_PASSWORD;
if (!connectionString || !password) throw new Error("INVOICEPRO_DATABASE_URL and INVOICEPRO_OWNER_PASSWORD are required");

const owner = await createOwnerAccount({
  name: "InvoicePro owner",
  email: "contact.almuyedsaad@gmail.com",
  passwordHash: await hashCustomerPassword(password),
});

console.log(JSON.stringify({ id: owner.id, email: owner.email, role: owner.role }));
