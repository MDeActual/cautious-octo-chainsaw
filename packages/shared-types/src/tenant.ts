export enum TenantStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
  Onboarding = 'onboarding',
}

export interface Tenant {
  id: string;
  tenantId: string;
  name: string;
  domain: string;
  status: TenantStatus;
  contactEmail: string;
  onboardedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantRequest {
  tenantId: string;
  name: string;
  domain: string;
  contactEmail: string;
}

export interface UpdateTenantRequest {
  name?: string;
  domain?: string;
  contactEmail?: string;
  status?: TenantStatus;
}
