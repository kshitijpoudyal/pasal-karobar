import type { BusinessMemberRepository } from "@/repository/business-member.repository";

export class OwnerPermissionError extends Error {
  constructor(message = "Only the shop owner can perform this action.") {
    super(message);
    this.name = "OwnerPermissionError";
  }
}

export class OwnerGuard {
  constructor(private readonly members: BusinessMemberRepository) {}

  async requireOwner(businessId: string): Promise<void> {
    const isOwner = await this.members.isOwner(businessId);
    if (!isOwner) {
      throw new OwnerPermissionError();
    }
  }
}
