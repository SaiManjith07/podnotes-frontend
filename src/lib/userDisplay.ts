/** Initials for avatar fallback from an email address. */
export function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "?";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}
