import type { CloudMatrixJwtClaims, UserRole } from '@cloudmatrix/shared-types';

/**
 * Extended Express Request with authentication claims
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      claims?: CloudMatrixJwtClaims;
    }
  }
}

/**
 * User info returned by /me endpoint
 */
export interface UserInfo {
  user_id: string;
  email: string;
  role: UserRole;
  tenant_id: string;
}
