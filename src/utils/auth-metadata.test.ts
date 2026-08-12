import { describe, expect, it } from "vitest";

import { canCreateBusiness, displayNameFromUser } from "@/utils/auth-metadata";

describe("auth metadata helpers", () => {
  it("detects owner signup flag", () => {
    expect(
      canCreateBusiness({
        id: "u1",
        app_metadata: {},
        user_metadata: { can_create_business: true },
        aud: "authenticated",
        created_at: "",
      }),
    ).toBe(true);
    expect(
      canCreateBusiness({
        id: "u2",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "",
      }),
    ).toBe(false);
  });

  it("reads display name from user metadata", () => {
    expect(
      displayNameFromUser({
        id: "u1",
        app_metadata: {},
        user_metadata: { display_name: "  Priya  " },
        aud: "authenticated",
        created_at: "",
      }),
    ).toBe("Priya");
    expect(
      displayNameFromUser({
        id: "u2",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "",
      }),
    ).toBeNull();
  });
});
