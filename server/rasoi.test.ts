import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user: TrpcContext["user"] = null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("rasoi procedures", () => {
  it("rejects menu mutations for non-admin visitors", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.menu.create({ name: "Test dish", description: "Should never be created" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("validates enquiry phone numbers before creating a record", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.enquiries.create({ name: "A", phone: "12" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("returns the seeded authoritative menu through the public procedure", async () => {
    const caller = appRouter.createCaller(createContext());
    const menu = await caller.menu.list();
    expect(menu.length).toBeGreaterThanOrEqual(83);
    expect(menu.some(({ item }) => item.name === "Aloo Paratha (1 pcs.)" && item.price === "₹50")).toBe(true);
  });
});
