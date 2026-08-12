"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { MoreVertical, Trash2, UserPlus, Users } from "lucide-react";

import { QueryState } from "@/components/layout/query-state";
import { runConfirmedAction, useConfirmDrawer } from "@/components/confirm-drawer";
import { Button } from "@/components/ui/button";
import { RegisterStaffModal } from "@/features/settings/components/register-staff-modal";
import {
  useCreateStaffMemberMutation,
  useRemoveStaffMemberMutation,
  useStaffMembersQuery,
} from "@/hooks/queries/use-staff-queries";
import { useActiveBusiness } from "@/providers/business-provider";
import { useActiveMember } from "@/providers/active-member-provider";
import { cn } from "@/lib/utils";
import type { StaffMemberView } from "@/actions/staff-members";
import { toast } from "@/components/toast";

function roleBadgeLabel(role: StaffMemberView["role"]): string {
  return role === "OWNER" ? "Owner" : "Staff";
}

type StaffMoreMenuProps = {
  onRemove: () => void;
  disabled?: boolean;
};

function StaffMoreMenu({ onRemove, disabled = false }: StaffMoreMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-label="More options"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full p-1.5 text-on-surface-variant transition-all hover:bg-surface-container-high/40 disabled:opacity-50"
      >
        <MoreVertical className="size-4" strokeWidth={1.75} />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full right-0 z-20 mt-1 min-w-40 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onRemove();
            }}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-error-container/40"
          >
            <Trash2 className="size-4 shrink-0" strokeWidth={1.75} />
            Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function StaffSection() {
  const { confirm } = useConfirmDrawer();
  const { businessId } = useActiveBusiness();
  const { isOwner } = useActiveMember();
  const staffQuery = useStaffMembersQuery(businessId, isOwner);
  const createMutation = useCreateStaffMemberMutation(businessId);
  const removeMutation = useRemoveStaffMemberMutation(businessId);

  const [modalOpen, setModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setDisplayName("");
    setEmail("");
    setPassword("");
    setFormError(null);
  }, []);

  const openModal = useCallback(() => {
    resetForm();
    setModalOpen(true);
  }, [resetForm]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    resetForm();
  }, [resetForm]);

  async function handleCreate() {
    setFormError(null);
    try {
      await createMutation.mutateAsync({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      });
      toast({
        title: "Staff registered",
        description: `${displayName.trim()} can now sign in with the email and password you set.`,
      });
      closeModal();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not register staff.");
    }
  }

  function handleRemove(member: StaffMemberView) {
    void runConfirmedAction(
      confirm,
      {
        title: "Remove staff member?",
        description: `Remove ${member.displayName} from this shop. They will no longer be able to sign in.`,
        confirmLabel: "Remove",
        cancelLabel: "Keep",
        tone: "destructive",
      },
      async () => {
        await removeMutation.mutateAsync(member.id);
        toast({
          title: "Staff removed",
          description: `${member.displayName} no longer has access to this shop.`,
        });
      },
    );
  }

  if (!isOwner) return null;

  const staff = staffQuery.data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="squircle flex size-12 shrink-0 items-center justify-center bg-primary-container text-on-primary-container">
            <Users className="size-6" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="font-headline text-xl font-semibold text-on-surface">
              Staff
            </h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Register staff with their own login. They share shop data; each entry
              is attributed to whoever is signed in.
            </p>
          </div>
        </div>
        <Button type="button" variant="primary" size="sm" onClick={openModal}>
          <UserPlus className="size-4" strokeWidth={1.75} />
          Register staff
        </Button>
      </div>

      <QueryState
        isLoading={staffQuery.isLoading}
        error={staffQuery.error}
        isEmpty={!staffQuery.isLoading && staff.length === 0}
        emptyTitle="No staff yet"
        emptyDescription="Register staff members so they can sign in and record entries under their own account."
        onRetry={() => void staffQuery.refetch()}
      >
        <ul className="space-y-3">
          {staff.map((member, index) => {
            const canRemove = member.role !== "OWNER";
            return (
              <li
                key={member.id}
                className={cn(
                  "squircle flex items-center justify-between gap-4 border border-outline-variant bg-surface-container-lowest p-4",
                  index % 3 === 0 && "bg-primary-container/10",
                )}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-on-surface">
                      {member.displayName}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                        member.role === "OWNER"
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface-container-high text-on-surface-variant",
                      )}
                    >
                      {roleBadgeLabel(member.role)}
                    </span>
                  </div>
                  {member.email ? (
                    <p className="truncate text-sm text-on-surface-variant">
                      {member.email}
                    </p>
                  ) : null}
                </div>
                {canRemove ? (
                  <StaffMoreMenu
                    disabled={removeMutation.isPending}
                    onRemove={() => handleRemove(member)}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </QueryState>

      <RegisterStaffModal
        open={modalOpen}
        onClose={closeModal}
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        onSubmit={() => void handleCreate()}
        isSubmitting={createMutation.isPending}
        error={formError}
      />
    </section>
  );
}
