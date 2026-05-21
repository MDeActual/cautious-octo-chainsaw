// Managed Identity to act as your "Agent-Orchestrator"
resource auditorIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: 'id-securepulse-auditor'
  location: resourceGroup().location
}

// Key Vault to store your Partner ID and PAL metadata
resource vault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'kv-securepulse-secrets'
  location: resourceGroup().location
  properties: {
    sku: { family: 'A', name: 'standard' }
    tenantId: subscription().tenantId
    accessPolicies: [
      {
        objectId: auditorIdentity.properties.principalId
        tenantId: subscription().tenantId
        permissions: { secrets: ['get', 'list'] }
      }
    ]
  }
}
