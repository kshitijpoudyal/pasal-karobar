import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Layers,
  ScanFace,
  Scissors,
  Sparkles,
  SprayCan,
  Star,
  UserRound,
} from "lucide-react";

/** Stored on `services.icon` — stable string ids, not component names. */
export const SERVICE_ICON_IDS = [
  "hair",
  "beard",
  "facial",
  "combo",
  "kids",
  "styling",
  "premium",
  "general",
] as const;

export type ServiceIconId = (typeof SERVICE_ICON_IDS)[number];

export const DEFAULT_SERVICE_ICON_ID: ServiceIconId = "hair";

export type ServiceIconDefinition = {
  id: ServiceIconId;
  label: string;
  icon: LucideIcon;
};

export const SERVICE_ICON_DEFINITIONS: ServiceIconDefinition[] = [
  { id: "hair", label: "Hair", icon: Scissors },
  { id: "beard", label: "Beard", icon: ScanFace },
  { id: "facial", label: "Facial", icon: Sparkles },
  { id: "combo", label: "Hair + beard", icon: Layers },
  { id: "kids", label: "Kids", icon: Baby },
  { id: "styling", label: "Styling", icon: SprayCan },
  { id: "premium", label: "Premium", icon: Star },
  { id: "general", label: "General", icon: UserRound },
];

const BY_ID = new Map<ServiceIconId, ServiceIconDefinition>(
  SERVICE_ICON_DEFINITIONS.map((def) => [def.id, def]),
);

/** Legacy seed / ad-hoc values → canonical ids. */
const LEGACY_ALIASES: Record<string, ServiceIconId> = {
  scissors: "hair",
  user: "combo",
  baby: "kids",
  sparkles: "facial",
};

export function normalizeServiceIconId(
  value: string | null | undefined,
): ServiceIconId {
  if (!value) return DEFAULT_SERVICE_ICON_ID;
  if (SERVICE_ICON_IDS.includes(value as ServiceIconId)) {
    return value as ServiceIconId;
  }
  return LEGACY_ALIASES[value] ?? DEFAULT_SERVICE_ICON_ID;
}

export function getServiceIconDefinition(
  value: string | null | undefined,
): ServiceIconDefinition {
  const id = normalizeServiceIconId(value);
  return BY_ID.get(id) ?? BY_ID.get(DEFAULT_SERVICE_ICON_ID)!;
}

export function getServiceIconComponent(value: string | null | undefined): LucideIcon {
  return getServiceIconDefinition(value).icon;
}
