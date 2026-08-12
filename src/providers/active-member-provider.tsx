"use client";

import { createContext, useContext, useMemo } from "react";

import { useActiveMemberQuery } from "@/hooks/queries/use-member-queries";
import { useAuth } from "@/providers/auth-provider";
import { useActiveBusiness } from "@/providers/business-provider";
import type { MemberRole } from "@/types/database";
import { displayNameFromUser } from "@/utils/auth-metadata";

type ActiveMemberContextValue = {
  userId: string;
  displayName: string;
  role: MemberRole | null;
  isOwner: boolean;
  /** Owner-only: change business configuration in Settings. */
  canEditSettings: boolean;
  /** Owner-only: delete transactions, photos, catalog rows, etc. */
  canDelete: boolean;
  isLoading: boolean;
};

const ActiveMemberContext = createContext<ActiveMemberContextValue | null>(null);

export function ActiveMemberProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const { businessId } = useActiveBusiness();
  const userId = session?.user.id ?? "";

  const memberQuery = useActiveMemberQuery(businessId, userId);

  const value = useMemo<ActiveMemberContextValue>(() => {
    const profileName = memberQuery.data?.profile?.display_name?.trim();
    const metadataName = displayNameFromUser(session?.user);
    const displayName = profileName || metadataName || "Staff";
    const role = memberQuery.data?.member.role ?? null;

    return {
      userId,
      displayName,
      role,
      isOwner: role === "OWNER",
      canEditSettings: role === "OWNER",
      canDelete: role === "OWNER",
      isLoading: Boolean(userId && businessId) && memberQuery.isLoading,
    };
  }, [businessId, memberQuery.data, memberQuery.isLoading, session?.user, userId]);

  return (
    <ActiveMemberContext.Provider value={value}>{children}</ActiveMemberContext.Provider>
  );
}

export function useActiveMember() {
  const ctx = useContext(ActiveMemberContext);
  if (!ctx) {
    throw new Error("useActiveMember must be used within ActiveMemberProvider");
  }
  return ctx;
}
