// App Service Plan and Web Apps for CloudMatrix services

param projectName string
param environmentName string
param location string
param tags object

var appServicePlanName = '${projectName}-${environmentName}-asp'

// App Service Plan (Linux, B2 for dev, P2v3 for prod)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: environmentName == 'prod' ? 'P2v3' : 'B2'
    tier: environmentName == 'prod' ? 'PremiumV3' : 'Basic'
  }
  properties: {
    reserved: true
  }
}

// Service definitions
var services = [
  { name: 'identity-service', port: '3001' }
  { name: 'graph-proxy', port: '3002' }
  { name: 'core-backend', port: '3003' }
  { name: 'automation-service', port: '3004' }
  { name: 'ai-service', port: '3005' }
]

// Web Apps for each service
resource webApps 'Microsoft.Web/sites@2023-01-01' = [for svc in services: {
  name: '${projectName}-${svc.name}-${environmentName}'
  location: location
  tags: tags
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        { name: 'NODE_ENV', value: environmentName }
        { name: 'PORT', value: svc.port }
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~20' }
      ]
      healthCheckPath: '/health'
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
      http20Enabled: true
    }
    httpsOnly: true
  }
}]

// Static Web App for Frontend
resource frontendStaticApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: '${projectName}-frontend-${environmentName}'
  location: location
  tags: tags
  sku: {
    name: environmentName == 'prod' ? 'Standard' : 'Free'
    tier: environmentName == 'prod' ? 'Standard' : 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: 'apps/frontend'
      outputLocation: 'dist'
      appBuildCommand: 'pnpm build'
    }
  }
}

output appServicePlanId string = appServicePlan.id
output frontendUrl string = 'https://${frontendStaticApp.properties.defaultHostname}'
