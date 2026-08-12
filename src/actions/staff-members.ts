"use server";

import { revalidatePath } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";

import { BusinessMemberRepository, ProfileRepository } from "@/repository/business-member.repository";
import { isMissingRpcFunctionError } from "@/repository/errors";
import { createSupabaseAdminClient } from "@/supabase/admin";
import { createSupabaseServerClient } from "@/supabase/server";
import type { StaffMemberRow } from "@/types/database";

export type CreateStaffMemberInput = {
  businessId: string;
  displayName: string;
  email: string;
  password: string;
};

export type StaffMemberView = {
  id: string;
  userId: string;
  role: StaffMemberRow["role"];
  displayName: string;
  email: string | null;
  createdAt: string;
};

export type StaffActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toStaffView(row: StaffMemberRow): StaffMemberView {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    displayName: row.profile?.display_name ?? "Staff",
    email: row.profile?.email ?? null,
    createdAt: row.created_at,
  };
}

function toActionError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as PostgrestError).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Something went wrong. Try again.";
}

function staffMigrationHint(error: PostgrestError | null | undefined): string | null {
  if (!error) return null;

  const haystack =
    `${error.code ?? ""} ${error.message} ${error.details ?? ""}`.toLowerCase();

  if (
    isMissingRpcFunctionError(error, "is_business_owner") ||
    haystack.includes("member_role") ||
    haystack.includes("profiles") ||
    haystack.includes("recorded_by_user_id")
  ) {
    return "Staff database migration is not applied. Run supabase/migrations/20260812120000_staff_profiles_and_attribution.sql in Supabase SQL Editor.";
  }

  return null;
}

function revalidateStaffViews() {
  try {
    revalidatePath("/staff-manager");
    revalidatePath("/settings");
  } catch {
    // Non-fatal when called outside a request context.
  }
}

async function requireOwner(businessId: string) {
  const supabase = await createSupabaseServerClient();
  const members = new BusinessMemberRepository(supabase);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated.");
  }

  const isOwner = await members.isOwner(businessId);
  if (!isOwner) {
    throw new Error("Only the shop owner can manage staff.");
  }

  return { supabase, user };
}

export async function listStaffMembers(
  businessId: string,
): Promise<StaffMemberView[]> {
  const { supabase } = await requireOwner(businessId);
  const membersRepo = new BusinessMemberRepository(supabase);
  const profilesRepo = new ProfileRepository(supabase);

  const members = await membersRepo.listByBusinessId(businessId);
  const profiles = await profilesRepo.findByIds(members.map((m) => m.user_id));
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  return members.map((member) =>
    toStaffView({
      ...member,
      profile: profileById.get(member.user_id) ?? null,
    }),
  );
}

export async function createStaffMember(
  input: CreateStaffMemberInput,
): Promise<StaffActionResult<StaffMemberView>> {
  const displayName = input.displayName.trim();
  const email = input.email.trim().toLowerCase();

  if (!displayName) {
    return { ok: false, error: "Staff name is required." };
  }
  if (!email) {
    return { ok: false, error: "Staff email is required." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Temporary password must be at least 6 characters." };
  }

  try {
    await requireOwner(input.businessId);
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it to your deployment environment.",
    };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (createError || !created.user) {
    const message = createError?.message ?? "Could not create staff account.";
    if (message.toLowerCase().includes("already")) {
      return { ok: false, error: "A user with this email already exists." };
    }
    return { ok: false, error: message };
  }

  const userId = created.user.id;

  try {
    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        display_name: displayName,
        email,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      const migrationHint = staffMigrationHint(profileError);
      throw new Error(migrationHint ?? profileError.message);
    }

    const { data: member, error: memberError } = await admin
      .from("business_members")
      .insert({
        business_id: input.businessId,
        user_id: userId,
        role: "STAFF",
      })
      .select("*")
      .single();

    if (memberError || !member) {
      const migrationHint = staffMigrationHint(memberError);
      throw new Error(
        migrationHint ?? memberError?.message ?? "Could not link staff to this shop.",
      );
    }

    revalidateStaffViews();

    return {
      ok: true,
      data: toStaffView({
        ...member,
        profile: {
          id: userId,
          display_name: displayName,
          email,
          created_at: member.created_at,
          updated_at: member.created_at,
        },
      }),
    };
  } catch (error) {
    try {
      await admin.auth.admin.deleteUser(userId);
    } catch {
      // Best-effort cleanup after a partial create.
    }
    return { ok: false, error: toActionError(error) };
  }
}

export async function removeStaffMember(
  businessId: string,
  memberId: string,
): Promise<StaffActionResult<void>> {
  try {
    const { supabase, user } = await requireOwner(businessId);
    const membersRepo = new BusinessMemberRepository(supabase);
    const members = await membersRepo.listByBusinessId(businessId);
    const target = members.find((m) => m.id === memberId);

    if (!target) return { ok: false, error: "Staff member not found." };
    if (target.role === "OWNER") {
      return { ok: false, error: "Cannot remove the shop owner." };
    }
    if (target.user_id === user.id) {
      return { ok: false, error: "You cannot remove your own owner account." };
    }

    await membersRepo.deleteById(memberId);

    const admin = createSupabaseAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(target.user_id);
    if (deleteError) {
      return { ok: false, error: deleteError.message };
    }

    revalidateStaffViews();
    return { ok: true, data: undefined };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("SUPABASE_SERVICE_ROLE_KEY")
    ) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: toActionError(error) };
  }
}
