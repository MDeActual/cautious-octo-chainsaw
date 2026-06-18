targetScope = 'subscription'

@description('Policy location')
param location string = deployment().location

@description('Assignment name suffix')
param environment string = 'dev'

@description('Allowed Azure regions for this initiative')
param allowedLocations array = [
  'canadacentral'
  'canadaeast'
]

@description('Allowed resource types exempt from location restrictions')
param locationExemptResourceTypes array = [
  'Microsoft.Authorization/policyAssignments'
  'Microsoft.Authorization/policyDefinitions'
  'Microsoft.Authorization/policySetDefinitions'
  'Microsoft.Insights/components'
]

var denyOutsideCanadaPolicyName = 'cmx-deny-outside-canada-${environment}'
var denyPublicNetworkPolicyName = 'cmx-deny-public-network-${environment}'
var requirePurviewPolicyName = 'cmx-require-purview-${environment}'
var policySetName = 'cmx-canada-sovereignty-initiative-${environment}'

resource denyOutsideCanada 'Microsoft.Authorization/policyDefinitions@2023-04-01' = {
  name: denyOutsideCanadaPolicyName
  properties: {
    policyType: 'Custom'
    mode: 'Indexed'
    displayName: 'CloudMatrix - Deny resources outside Canada Central/East'
    description: 'Prevents resource deployment outside approved Canadian regions.'
    metadata: {
      category: 'Sovereignty'
    }
    parameters: {
      allowedLocations: {
        type: 'Array'
        metadata: {
          displayName: 'Allowed locations'
        }
      }
      locationExemptResourceTypes: {
        type: 'Array'
        metadata: {
          displayName: 'Exempt resource types'
        }
      }
    }
    policyRule: {
      if: {
        allOf: [
          {
            field: 'type'
            notIn: '[parameters(''locationExemptResourceTypes'')]'
          }
          {
            field: 'location'
            notIn: '[parameters(''allowedLocations'')]'
          }
        ]
      }
      then: {
        effect: 'deny'
      }
    }
  }
}

resource denyPublicNetwork 'Microsoft.Authorization/policyDefinitions@2023-04-01' = {
  name: denyPublicNetworkPolicyName
  properties: {
    policyType: 'Custom'
    mode: 'Indexed'
    displayName: 'CloudMatrix - Deny public network access for core data/security resources'
    description: 'Blocks enabling public network access for selected services used in compliance and evidence workflows.'
    metadata: {
      category: 'Network Security'
    }
    policyRule: {
      if: {
        anyOf: [
          {
            allOf: [
              {
                field: 'type'
                equals: 'Microsoft.Storage/storageAccounts'
              }
              {
                field: 'Microsoft.Storage/storageAccounts/publicNetworkAccess'
                equals: 'Enabled'
              }
            ]
          }
          {
            allOf: [
              {
                field: 'type'
                equals: 'Microsoft.KeyVault/vaults'
              }
              {
                field: 'Microsoft.KeyVault/vaults/publicNetworkAccess'
                equals: 'Enabled'
              }
            ]
          }
          {
            allOf: [
              {
                field: 'type'
                equals: 'Microsoft.Purview/accounts'
              }
              {
                field: 'Microsoft.Purview/accounts/publicNetworkAccess'
                equals: 'Enabled'
              }
            ]
          }
        ]
      }
      then: {
        effect: 'deny'
      }
    }
  }
}

resource requirePurview 'Microsoft.Authorization/policyDefinitions@2023-04-01' = {
  name: requirePurviewPolicyName
  properties: {
    policyType: 'Custom'
    mode: 'Indexed'
    displayName: 'CloudMatrix - Require Purview account in subscription'
    description: 'Audits subscription for Microsoft Purview account presence to support compliance evidence generation.'
    metadata: {
      category: 'Compliance'
    }
    policyRule: {
      if: {
        field: 'type'
        equals: 'Microsoft.Resources/subscriptions'
      }
      then: {
        effect: 'auditIfNotExists'
        details: {
          type: 'Microsoft.Purview/accounts'
          existenceCondition: {
            field: 'name'
            like: '*'
          }
        }
      }
    }
  }
}

resource sovereigntyInitiative 'Microsoft.Authorization/policySetDefinitions@2023-04-01' = {
  name: policySetName
  properties: {
    policyType: 'Custom'
    displayName: 'CloudMatrix - Canada Sovereignty and Compliance Initiative'
    description: 'Groups Canada-only residency, public network controls, and Purview baseline checks for MSSP workloads.'
    metadata: {
      category: 'Regulatory Compliance'
      frameworks: [
        'Law 25'
        'PIPEDA'
        'ITSG-33'
        'CIS Controls v8'
      ]
    }
    parameters: {
      allowedLocations: {
        type: 'Array'
        defaultValue: allowedLocations
      }
      locationExemptResourceTypes: {
        type: 'Array'
        defaultValue: locationExemptResourceTypes
      }
    }
    policyDefinitions: [
      {
        policyDefinitionId: denyOutsideCanada.id
        parameters: {
          allowedLocations: {
            value: '[parameters(''allowedLocations'')]'
          }
          locationExemptResourceTypes: {
            value: '[parameters(''locationExemptResourceTypes'')]'
          }
        }
      }
      {
        policyDefinitionId: denyPublicNetwork.id
      }
      {
        policyDefinitionId: requirePurview.id
      }
    ]
  }
}

resource sovereigntyAssignment 'Microsoft.Authorization/policyAssignments@2024-04-01' = {
  name: 'cmx-canada-sovereignty-assignment-${environment}'
  location: location
  properties: {
    displayName: 'CloudMatrix - Canada Sovereignty Assignment'
    description: 'Assigns Canada-only residency, network hardening, and Purview compliance baseline checks.'
    policyDefinitionId: sovereigntyInitiative.id
    parameters: {
      allowedLocations: {
        value: allowedLocations
      }
      locationExemptResourceTypes: {
        value: locationExemptResourceTypes
      }
    }
    enforcementMode: 'Default'
  }
}

output initiativeName string = sovereigntyInitiative.name
output assignmentName string = sovereigntyAssignment.name
