export function applicationScope(value: string | undefined): string {
  if (!value || !/^api:\/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[A-Za-z][A-Za-z0-9_.-]*$/.test(value)
      || value.includes('00000003-0000-0000-c000-000000000000')) {
    throw new Error('SecurePulse application API scope is not configured');
  }
  return value;
}
