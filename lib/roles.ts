/**
 * Role hierarchy helpers — single source of truth for all role checks.
 * Roles (ascending privilege): user → owner → admin → superadmin
 */

export type Role = 'user' | 'owner' | 'admin' | 'superadmin'

/** Accepts admin OR superadmin */
export const isAdmin      = (role: string) => role === 'admin' || role === 'superadmin'
/** Only superadmin */
export const isSuperAdmin = (role: string) => role === 'superadmin'
/** Only owner */
export const isOwner      = (role: string) => role === 'owner'
/** Any staff (admin or superadmin) */
export const isStaff      = (role: string) => isAdmin(role)

/** Human-readable label & badge for each role */
export const ROLE_META: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  superadmin: { label: 'Super Admin', emoji: '👑', color: '#D97706', bg: '#FEF3C7' },
  admin:      { label: 'Admin',       emoji: '🛡️', color: '#0A4A5E', bg: '#E0F2FE' },
  owner:      { label: 'Owner',       emoji: '🏪', color: '#7C3AED', bg: '#EDE9FE' },
  user:       { label: 'Member',      emoji: '🌟', color: '#059669', bg: '#D1FAE5' },
}
