import { describe, expect, it } from "vitest";

import { escapeIlikePattern } from "@/utils/escape-ilike";

describe("escapeIlikePattern", () => {
  it("escapes ilike wildcards", () => {
    expect(escapeIlikePattern("100% off")).toBe("100\\% off");
    expect(escapeIlikePattern("a_b")).toBe("a\\_b");
    expect(escapeIlikePattern("path\\to")).toBe("path\\\\to");
  });
});
