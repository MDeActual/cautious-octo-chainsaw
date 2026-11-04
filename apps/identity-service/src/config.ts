import { loadAuthConfig, type JwtValidationConfig } from '@cloudmatrix/auth-utils';

export interface IdentityServiceConfig {
  port: number;
  auth: JwtValidationConfig;
}
export function loadConfig(): IdentityServiceConfig {
  return {
    port: parseInt(process.env['IDENTITY_SERVICE_PORT'] ?? '3001', 10),
    auth: loadAuthConfig(),
  };
}
