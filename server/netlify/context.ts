import type { Request, Response } from "express";
import type { User } from "./schema";
import { getCustomerUserFromRequest } from "./customerAuth";

export type TrpcContext = {
  req: Request;
  res: Response;
  user: User | null;
};

export async function createContext(opts: { req: Request; res: Response }): Promise<TrpcContext> {
  return { req: opts.req, res: opts.res, user: await getCustomerUserFromRequest(opts.req) };
}
