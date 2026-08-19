import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const storageMocks = vi.hoisted(() => ({ storagePut: vi.fn() }));

vi.mock("./storage", () => storageMocks);

import { appRouter } from "./routers";

function context(): TrpcContext {
  return {
    user: {
      id: 11,
      openId: "logo-test-user",
      name: "Logo Test",
      email: "logo@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("managed profile logo upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageMocks.storagePut.mockResolvedValue({ key: "invoicepro/11/logos/logo.png", url: "/manus-storage/invoicepro/11/logos/logo.png" });
  });

  it("stores a valid PNG through managed storage and returns the stored logo path", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.profile.uploadLogo({ dataUrl: "data:image/png;base64,AAAAAAAAAAAAAAAAAAAAAAAA" });
    expect(result.url).toBe("/manus-storage/invoicepro/11/logos/logo.png");
    expect(storageMocks.storagePut).toHaveBeenCalledWith(expect.stringMatching(/^invoicepro\/11\/logos\/\d+\.png$/), expect.any(Buffer), "image/png");
  });

  it("rejects a non-image data URL before storage is called", async () => {
    const caller = appRouter.createCaller(context());
    await expect(caller.profile.uploadLogo({ dataUrl: "data:text/plain;base64,aGVsbG8=" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(storageMocks.storagePut).not.toHaveBeenCalled();
  });
});
