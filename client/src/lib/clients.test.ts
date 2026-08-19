import { describe, expect, it } from "vitest";
import { filterClients } from "./clients";

describe("client filtering", () => {
  const clients = [
    { name: "North Studio", email: "hello@north.example", phone: "01700000001" },
    { name: "Tara Media", email: "team@tara.example", phone: "01800000002" },
  ];

  it("finds saved clients by name, email, or phone without changing the source list", () => {
    expect(filterClients(clients, "north")).toEqual([clients[0]]);
    expect(filterClients(clients, "tara.example")).toEqual([clients[1]]);
    expect(filterClients(clients, "01700000001")).toEqual([clients[0]]);
    expect(filterClients(clients, "")).toBe(clients);
    expect(clients).toHaveLength(2);
  });
});
