import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invoiceStatusValues } from "../drizzle/schema";
import { COOKIE_NAME } from "../shared/const";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

const paymentMethodSchema = z.enum(["bkash", "nagad", "rocket", "bank_transfer"]);
const invoiceStatusSchema = z.enum(invoiceStatusValues);
const logoUrlSchema = z.string().trim().max(2000).refine(value => value.startsWith("/manus-storage/") || /^https:\/\//.test(value), "Use an uploaded logo or a secure image URL");

const profileInput = z.object({
  businessName: z.string().trim().min(2).max(160),
  logoUrl: logoUrlSchema.nullable().optional(),
  phone: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(320),
  bkashNumber: z.string().trim().max(40).nullable().optional(),
  nagadNumber: z.string().trim().max(40).nullable().optional(),
  rocketNumber: z.string().trim().max(40).nullable().optional(),
  bankTransferInstructions: z.string().trim().max(2000).nullable().optional(),
});

const clientInput = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(320).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  address: z.string().trim().max(1000).nullable().optional(),
});

const itemInput = z.object({
  description: z.string().trim().min(1).max(300),
  quantityHundredths: z.number().int().min(1).max(1_000_000),
  unitAmountPaisa: z.number().int().min(0).max(100_000_000),
});

const invoiceInput = z.object({
  clientId: z.number().int().positive().nullable().optional(),
  clientName: z.string().trim().max(160).nullable().optional(),
  clientEmail: z.string().trim().email().max(320).nullable().optional(),
  clientPhone: z.string().trim().max(40).nullable().optional(),
  clientAddress: z.string().trim().max(1000).nullable().optional(),
  billingType: z.enum(["fixed_price", "itemized"]),
  dueDate: z.number().int().nullable().optional(),
  discountPaisa: z.number().int().min(0).max(100_000_000),
  notes: z.string().trim().max(3000).nullable().optional(),
  items: z.array(itemInput).min(1).max(40),
});

function ownerProcedure() {
  return protectedProcedure.use(({ ctx, next }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Owner access is required" });
    return next();
  });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  profile: router({
    get: protectedProcedure.query(({ ctx }) => db.getProfile(ctx.user.id)),
    save: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => db.saveProfile(ctx.user.id, input)),
    uploadLogo: protectedProcedure.input(z.object({ dataUrl: z.string().min(32).max(3_000_000) })).mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Upload a PNG, JPEG, or WebP logo" });
      const contentType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.length === 0 || buffer.length > 2_000_000) throw new TRPCError({ code: "BAD_REQUEST", message: "Logo must be smaller than 2 MB" });
      const extension = contentType === "image/jpeg" ? "jpg" : contentType.split("/")[1];
      const { url } = await storagePut(`invoicepro/${ctx.user.id}/logos/${Date.now()}.${extension}`, buffer, contentType);
      return { url };
    }),
  }),
  clients: router({
    list: protectedProcedure.query(({ ctx }) => db.listClients(ctx.user.id)),
    create: protectedProcedure.input(clientInput).mutation(({ ctx, input }) => db.createClient(ctx.user.id, input)),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), values: clientInput })).mutation(({ ctx, input }) => db.updateClient(ctx.user.id, input.id, input.values)),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => db.deleteClient(ctx.user.id, input.id)),
  }),
  invoices: router({
    list: protectedProcedure.query(({ ctx }) => db.listInvoices(ctx.user.id)),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ ctx, input }) => db.getInvoiceDetail(ctx.user.id, input.id)),
    create: protectedProcedure.input(invoiceInput).mutation(({ ctx, input }) => db.createInvoice(ctx.user.id, input)),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), values: invoiceInput })).mutation(({ ctx, input }) => db.updateInvoice(ctx.user.id, input.id, input.values)),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => db.deleteInvoice(ctx.user.id, input.id)),
    updateStatus: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: invoiceStatusSchema })).mutation(({ ctx, input }) => db.updateInvoiceStatus(ctx.user.id, input.id, input.status)),
    addPayment: protectedProcedure.input(z.object({
      invoiceId: z.number().int().positive(),
      amountPaisa: z.number().int().positive(),
      method: paymentMethodSchema,
      receivedAt: z.number().int().nullable().optional(),
      note: z.string().trim().max(1000).nullable().optional(),
    })).mutation(({ ctx, input }) => db.addInvoicePayment(ctx.user.id, input)),
  }),
  dashboard: router({
    summary: protectedProcedure.query(({ ctx }) => db.getDashboard(ctx.user.id)),
    followUps: protectedProcedure.query(({ ctx }) => db.getFollowUps(ctx.user.id)),
    subscription: protectedProcedure.query(({ ctx }) => db.getSubscription(ctx.user.id)),
  }),
  publicInvoice: router({
    get: publicProcedure.input(z.object({ token: z.string().min(20).max(64) })).query(({ input }) => db.getPublicInvoice(input.token)),
    markViewed: publicProcedure.input(z.object({ token: z.string().min(20).max(64) })).mutation(({ input }) => db.markPublicInvoiceViewed(input.token)),
  }),
  admin: router({
    users: ownerProcedure().query(() => db.listAdminUsers()),
    updateSubscription: ownerProcedure().input(z.object({
      userId: z.number().int().positive(),
      status: z.enum(["inactive", "active", "expired"]),
      activeUntil: z.number().int().nullable().optional(),
      lastPaymentMethod: paymentMethodSchema.nullable().optional(),
      ownerNote: z.string().trim().max(2000).nullable().optional(),
    })).mutation(({ ctx, input }) => db.updateSubscription(ctx.user.id, input)),
  }),
});

export type AppRouter = typeof appRouter;
