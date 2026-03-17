// CloudMatrix MSSP Platform — Azure Infrastructure
// Phase 1: App Services + PostgreSQL (Neon) + Azure Front Door + WAF

targetScope = 'resourceGroup'

@description('Environment name (dev, staging, prod)')
param environment string = 'dev'

@description('Azure region')
param location string = resourceGroup().location

@description('Application Insights connection string')
@secure()
param appInsightsConnectionString string = ''

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: 'asp-cloudmatrix-${environment}'
  location: location
  kind: 'linux'
  sku: {
    name: 'B2'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

// identity-service
resource identityService 'Microsoft.Web/sites@2023-01-01' = {
  name: 'app-cloudmatrix-identity-${environment}'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        { name: 'IDENTITY_SERVICE_PORT', value: '3001' }
        { name: 'APP_INSIGHTS_CONNECTION_STRING', value: appInsightsConnectionString }
      ]
    }
  }
}

// graph-proxy
resource graphProxy 'Microsoft.Web/sites@2023-01-01' = {
  name: 'app-cloudmatrix-graph-${environment}'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        { name: 'GRAPH_PROXY_PORT', value: '3002' }
        { name: 'APP_INSIGHTS_CONNECTION_STRING', value: appInsightsConnectionString }
      ]
    }
  }
}

// core-backend
resource coreBackend 'Microsoft.Web/sites@2023-01-01' = {
  name: 'app-cloudmatrix-core-${environment}'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        { name: 'CORE_BACKEND_PORT', value: '3003' }
        { name: 'APP_INSIGHTS_CONNECTION_STRING', value: appInsightsConnectionString }
      ]
    }
  }
}

output identityServiceUrl string = 'https://${identityService.properties.defaultHostName}'
output graphProxyUrl string = 'https://${graphProxy.properties.defaultHostName}'
output coreBackendUrl string = 'https://${coreBackend.properties.defaultHostName}'
