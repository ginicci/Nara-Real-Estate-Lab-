// Immutable user IDs, never self-asserted email addresses. Empty means deny all.
export function canReviewLeads(userId: string, configuredIds = process.env.NARA_ADMIN_USER_IDS ?? '') {
  return configuredIds.split(',').map((id) => id.trim()).filter(Boolean).includes(userId)
}
