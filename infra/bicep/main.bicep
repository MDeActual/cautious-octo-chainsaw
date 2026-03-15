// CloudMatrix MSSP Platform - Azure Infrastructure
// This Bicep template deploys the core Azure resources

targetScope = 'subscription'

@description('Environment name (dev, staging, prod)')
param environmentName string = 'dev'

@description('Azure region for resource deployment')
param location string = 'canadacentral'

@description('Project name prefix for resource naming')
param projectName string = 'cloudmatrix'

var resourceGroupName = '${projectName}-${environmentName}-rg'
var tags = {
  Project: projectName
  Environment: environmentName
  ManagedBy: 'Bicep'
}

// Resource Group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2023-07-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

// Deploy app infrastructure module
module appInfra 'modules/app-services.bicep' = {
  scope: resourceGroup
  name: 'app-services-${environmentName}'
  params: {
    projectName: projectName
    environmentName: environmentName
    location: location
    tags: tags
  }
}

output resourceGroupName string = resourceGroup.name
output appServicePlanId string = appInfra.outputs.appServicePlanId
