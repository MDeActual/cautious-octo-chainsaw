import { UserRole } from '@cloudmatrix/shared-types';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';


export interface JwtPayload {
  sub: string;
  oid: string;
  email: string;
  name: string;
  roles: UserRole[];
  tid: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
}

function getJwksClient(tenantId: string): jwksClient.JwksClient {
  return jwksClient({
    jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000,
  });
}

function getSigningKey(client: jwksClient.JwksClient, kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        reject(err);
        return;
      }
      if (!key) {
        reject(new Error('No signing key found'));
        return;
      }
      resolve(key.getPublicKey());
    });
  });
}

export async function validateJwt(token: string, tenantId: string): Promise<JwtPayload> {
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    throw new Error('Invalid JWT format');
  }

  const client = getJwksClient(tenantId);
  const signingKey = await getSigningKey(client, decoded.header.kid);

  const payload = jwt.verify(token, signingKey, {
    algorithms: ['RS256'],
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
  });

  if (typeof payload === 'string') {
    throw new Error('Invalid JWT payload');
  }

  return payload as JwtPayload;
}
