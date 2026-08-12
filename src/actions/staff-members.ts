"use server";

import { revalidatePath } from "next/cache";

import { BusinessMemberRepository, ProfileRepository } from "@/repository/business-member.repository";
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
): Promise<StaffMemberView> {
  const displayName = input.displayName.trim();
  const email = input.email.trim().toLowerCase();

  if (!displayName) throw new Error("Staff name is required.");
  if (!email) throw new Error("Staff email is required.");
  if (input.password.length < 6) {
    throw new Error("Temporary password must be at least 6 characters.");
  }

  await requireOwner(input.businessId);

  const admin = createSupabaseAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Could not create staff account.");
  }

  const userId = created.user.id;

  try {
    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      display_name: displayName,
      email,
    });

    if (profileError) throw profileError;

    const { data: member, error: memberError } = await admin
      .from("business_members")
      .insert({
        business_id: input.businessId,
        user_id: userId,
        role: "STAFF",
      })
      .select("*")
      .single();

    if (memberError || !member) throw memberError ?? new Error("Could not link staff.");

    revalidatePath("/settings");

    return toStaffView({
      ...member,
      profile: {
        id: userId,
        display_name: displayName,
        email,
        created_at: member.created_at,
        updated_at: member.created_at,
      },
    });
  } catch (error) {
    await admin.auth.admin.deleteUser(userId);
    throw error instanceof Error ? error : new Error("Could not create staff member.");
  }
}

export async function removeStaffMember(
  businessId: string,
  memberId: string,
): Promise<void> {
  const { supabase, user } = await requireOwner(businessId);
  const membersRepo = new BusinessMemberRepository(supabase);
  const members = await membersRepo.listByBusinessId(businessId);
  const target = members.find((m) => m.id === memberId);

  if (!target) throw new Error("Staff member not found.");
  if (target.role === "OWNER") throw new Error("Cannot remove the shop owner.");
  if (target.user_id === user.id) {
    throw new Error("You cannot remove your own owner account.");
  }

  await membersRepo.deleteById(memberId);

  const admin = createSupabaseAdminClient();
  await admin.auth.admin.deleteUser(target.user_id);

  revalidatePath("/settings");
}
