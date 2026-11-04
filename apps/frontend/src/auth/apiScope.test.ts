import { expect, it } from 'vitest';
import { applicationScope } from './apiScope';

it('requires an explicit application scope instead of identity/Graph/default scopes', () => {
  for (const value of [undefined, '', 'openid', 'User.Read', 'https://graph.microsoft.com/.default',
    'api://44444444-4444-4444-8444-444444444444/.default',
    'api://00000003-0000-0000-c000-000000000000/user_impersonation']) {
    expect(() => applicationScope(value)).toThrow();
  }
  const scope = 'api://44444444-4444-4444-8444-444444444444/user_impersonation';
  expect(applicationScope(scope)).toBe(scope);
});
