import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const appEnvFiles = [
  {
    name: 'identity-service',
    relativePath: 'apps/identity-service/.env',
    contents: [
      'IDENTITY_SERVICE_PORT=3001',
      'TENANT_ISSUER=',
      'API_AUDIENCE=',
      'ENTRA_CLIENT_ID=',
      'ENTRA_TENANT_ID=',
      'APP_INSIGHTS_CONNECTION_STRING=',
      'ALLOW_AUTH_BYPASS=true',
      '',
    ].join('\n'),
  },
  {
    name: 'graph-proxy',
    relativePath: 'apps/graph-proxy/.env',
    contents: [
      'GRAPH_PROXY_PORT=3002',
      'GRAPH_CLIENT_ID=',
      'GRAPH_CLIENT_SECRET=',
      'GRAPH_SCOPE=https://graph.microsoft.com/.default',
      'APP_INSIGHTS_CONNECTION_STRING=',
      '',
    ].join('\n'),
  },
  {
    name: 'core-backend',
    relativePath: 'apps/core-backend/.env',
    contents: [
      'CORE_BACKEND_PORT=3003',
      'GRAPH_PROXY_URL=http://localhost:3002',
      'IDENTITY_SERVICE_URL=http://localhost:3001',
      'POSTGRES_URL=',
      'AUTOMATION_SERVICE_URL=http://localhost:3004',
      'AI_SERVICE_URL=http://localhost:3005',
      'APP_INSIGHTS_CONNECTION_STRING=',
      '',
    ].join('\n'),
  },
  {
    name: 'automation-service',
    relativePath: 'apps/automation-service/.env',
    contents: [
      'AUTOMATION_SERVICE_PORT=3004',
      'APP_INSIGHTS_CONNECTION_STRING=',
      '',
    ].join('\n'),
  },
  {
    name: 'ai-service',
    relativePath: 'apps/ai-service/.env',
    contents: [
      'AI_SERVICE_PORT=3005',
      'AZURE_OPENAI_ENDPOINT=',
      'AZURE_OPENAI_API_KEY=',
      'AZURE_OPENAI_DEPLOYMENT=gpt-4',
      'APP_INSIGHTS_CONNECTION_STRING=',
      '',
    ].join('\n'),
  },
  {
    name: 'frontend',
    relativePath: 'apps/frontend/.env',
    contents: [
      'VITE_ENTRA_CLIENT_ID=',
      'VITE_ENTRA_TENANT_ID=',
      'VITE_IDENTITY_API=http://localhost:3001',
      'VITE_CORE_API=http://localhost:3003',
      '',
    ].join('\n'),
  },
];

const created = [];
const skipped = [];

for (const file of appEnvFiles) {
  const targetPath = path.join(repoRoot, file.relativePath);

  if (fs.existsSync(targetPath)) {
    skipped.push(file.relativePath);
    continue;
  }

  fs.writeFileSync(targetPath, file.contents, 'utf8');
  created.push(file.relativePath);
}

console.log('SecurePulse local MVP setup');
console.log('===========================');

if (created.length > 0) {
  console.log('\nCreated:');
  for (const item of created) {
    console.log(`- ${item}`);
  }
}

if (skipped.length > 0) {
  console.log('\nSkipped existing files:');
  for (const item of skipped) {
    console.log(`- ${item}`);
  }
}

console.log('\nCurrent local MVP state:');
console.log('- frontend will run in demo mode until Entra settings are added');
console.log('- identity-service will start with local auth bypass enabled');
console.log('- graph-proxy will continue returning mock Microsoft Graph data');
console.log('- core-backend will use the in-memory assessment store');
console.log('- automation-service will log received events');
console.log('- ai-service will use mock responses until Azure OpenAI credentials are added');

console.log('\nNext commands:');
console.log('- pnpm build');
console.log('- pnpm dev');
