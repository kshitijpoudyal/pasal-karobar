"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { StaffSection } from "@/features/staff-manager/components/staff-section";
import { useActiveMember } from "@/providers/active-member-provider";

export function StaffManagerPage() {
  const router = useRouter();
  const { isOwner } = useActiveMember();

  useEffect(() => {
    if (!isOwner) router.replace("/");
  }, [isOwner, router]);

  if (!isOwner) return null;

  return (
    <AppShell
      desktopHeaderTitle="Staff Manager"
      shellClassName="curator-activity text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed"
      mainClassName="overflow-y-auto"
    >
      <div className="px-5 pt-6 pb-8 lg:space-y-12 lg:px-12 lg:pt-12 lg:pb-16">
        <section className="mb-8 lg:hidden">
          <h2 className="font-headline text-[28px] leading-tight font-medium text-primary">
            Staff Manager
          </h2>
          <p className="font-body-md mt-2 text-on-surface-variant">
            Register staff accounts and manage who can sign in to your shop.
          </p>
        </section>
        <StaffSection />
      </div>
    </AppShell>
  );
}
