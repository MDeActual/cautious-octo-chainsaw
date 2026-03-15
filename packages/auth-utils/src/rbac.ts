import { UserRole } from '@cloudmatrix/shared-types';

export const ROLES = {
  [UserRole.Admin]: ['read', 'write', 'delete', 'admin'],
  [UserRole.Analyst]: ['read', 'write'],
  [UserRole.Sales]: ['read'],
  [UserRole.ReadOnly]: ['read'],
} as const satisfies Record<UserRole, readonly string[]>;

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLES[role] as readonly string[];
  return permissions.includes(permission);
}
