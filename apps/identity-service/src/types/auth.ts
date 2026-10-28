import type { VerifiedPrincipal } from '@cloudmatrix/shared-types';

declare global {
  namespace Express {
    interface Request { principal?: VerifiedPrincipal; }
  }
}

export interface UserInfo {
  user_id: string;
  tenant_id: string;
}
