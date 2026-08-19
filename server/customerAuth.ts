import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { parse } from "cookie";
import type { Request, Response } from "express";
import type { User } from "../drizzle/schema";
import { getUserById } from "./db";
import { ENV } from "./_core/env";

const scrypt = promisify(scryptCallback);
export const CUSTOMER_SESSION_COOKIE = "invoicepro_customer_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 14;

function signingKey() {
  if (!ENV.cookieSecret) throw new Error("Session secret is not configured");
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function hashCustomerPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("base64url")}`;
}

export async function verifyCustomerPassword(password: string, storedValue: string) {
  const [salt, expectedValue] = storedValue.split(":");
  if (!salt || !expectedValue) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedValue, "base64url");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export async function createCustomerSession(user: User) {
  return new SignJWT({ kind: "invoicepro_customer", role: user.role, customerSessionVersion: user.customerSessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(signingKey());
}

export function setCustomerSessionCookie(req: Request, res: Response, token: string) {
  const secure = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https";
  res.cookie(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS * 1000,
  });
}

export function clearCustomerSessionCookie(req: Request, res: Response) {
  const secure = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https";
  const options = { httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge: 0, expires: new Date(0) };
  res.cookie(CUSTOMER_SESSION_COOKIE, "", options);
  // Clear a legacy non-secure development cookie too, in case a proxy changed
  // the perceived protocol between login and logout.
  res.cookie(CUSTOMER_SESSION_COOKIE, "", { ...options, secure: false });
}

export async function getCustomerUserFromRequest(req: Request): Promise<User | null> {
  const token = parse(req.headers.cookie || "")[CUSTOMER_SESSION_COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey());
    if (payload.kind !== "invoicepro_customer" || !payload.sub) return null;
    if (typeof payload.customerSessionVersion !== "number") return null;
    const user = await getUserById(Number(payload.sub));
    return user && user.customerSessionVersion === payload.customerSessionVersion ? user : null;
  } catch {
    return null;
  }
}
