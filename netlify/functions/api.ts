import express from "express";
import serverless from "serverless-http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "../../server/netlify/context";
import { appRouter } from "../../server/netlify/routers";
import { createOwnerAccount } from "../../server/netlify/db.pg";
import { hashCustomerPassword } from "../../server/netlify/customerAuth";
import { getStoredAsset } from "../../server/netlify/storage";

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

let ownerBootstrap: Promise<void> | undefined;
function ensureOwnerAccount() {
  if (ownerBootstrap) return ownerBootstrap;
  const email = process.env.INVOICEPRO_OWNER_EMAIL || "contact.almuyedsaad@gmail.com";
  const password = process.env.INVOICEPRO_OWNER_PASSWORD;
  if (!email || !password) return Promise.resolve();
  ownerBootstrap = hashCustomerPassword(password)
    .then(passwordHash => createOwnerAccount({ name: process.env.INVOICEPRO_OWNER_NAME || "InvoicePro owner", email, passwordHash }))
    .then(() => undefined);
  return ownerBootstrap;
}

app.use(async (_req, _res, next) => {
  try {
    await ensureOwnerAccount();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/assets/*", async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params[0] || "");
    const blob = await getStoredAsset(key);
    if (!blob) return res.status(404).send("Asset not found");
    const extension = key.split(".").pop()?.toLowerCase();
    const contentType = extension === "png" ? "image/png" : extension === "jpg" || extension === "jpeg" ? "image/jpeg" : extension === "webp" ? "image/webp" : "application/octet-stream";
    res.type(contentType).send(Buffer.from(await blob.arrayBuffer()));
  } catch (error) {
    next(error);
  }
});

app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

export const handler = serverless(app);
