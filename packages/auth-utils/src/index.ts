import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import type { CloudMatrixJwtClaims, UserRole } from '@cloudmatrix/shared-types';

export interface JwtValidationConfig {
  tenantIssuer: string;
  audience: string;
}

/**
 * Creates a JWKS client for the given Entra ID tenant issuer.
 */
export function createJwksClient(tenantIssuer: string): jwksClient.JwksClient {
  return jwksClient({
    jwksUri: `${tenantIssuer}/discovery/v2.0/keys`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  });
}

/**
 * Validates an Entra ID JWT and returns the decoded claims.
 * Throws if the token is invalid or expired.
 */
export async function validateEntraToken(
  token: string,
  config: JwtValidationConfig,
): Promise<CloudMatrixJwtClaims> {
  const client = createJwksClient(config.tenantIssuer);

  const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
    if (!header.kid) {
      callback(new Error('No kid in JWT header'));
      return;
    }
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, key?.getPublicKey());
    });
  };

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: config.audience,
        issuer: config.tenantIssuer,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(decoded as CloudMatrixJwtClaims);
      },
    );
  });
}

/**
 * Extracts the Bearer token from an Authorization header value.
 * Returns null if the header is missing or malformed.
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Checks whether a user role satisfies the required minimum role.
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy: Record<UserRole, number> = {
    Sales: 1,
    Analyst: 2,
    Admin: 3,
  };
  return hierarchy[userRole] >= hierarchy[requiredRole];
}
