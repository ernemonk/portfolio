/**
 * The portfolio owner's Firebase UID.
 *
 * Public pages always display data for this account.
 * To override (e.g. when running a forked copy), set NEXT_PUBLIC_OWNER_UID
 * in .env.local — otherwise the hardcoded default is used.
 */
export const OWNER_UID: string =
  process.env.NEXT_PUBLIC_OWNER_UID ?? "1lUDhgCStvPddp1hcriXDGR6Ds43";

/** Convenience function kept for backwards-compat with existing callers. */
export function getOwnerUid(): string {
  return OWNER_UID;
}
