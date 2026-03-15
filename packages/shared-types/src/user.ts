export enum UserRole {
  Admin = 'admin',
  Analyst = 'analyst',
  Sales = 'sales',
  ReadOnly = 'read_only',
}

export interface User {
  id: string;
  entraId: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  entraId: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}
