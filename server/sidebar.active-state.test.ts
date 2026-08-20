import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");

describe("workspace sidebar active state", () => {
  it("keeps selected sidebar labels and icons readable on the white active bar", () => {
    const sidebar = readFileSync(resolve(root, "client/src/components/DashboardLayout.tsx"), "utf8");
    const styles = readFileSync(resolve(root, "client/src/index.css"), "utf8");

    expect(sidebar).toContain('className="sidebar-link h-11');
    expect(styles).toContain('.sidebar-link[data-active="true"] { background:#fff!important; color:var(--ink)!important;');
    expect(styles).toContain('.sidebar-link[data-active="true"] svg { color:var(--teal)!important;');
  });
});
