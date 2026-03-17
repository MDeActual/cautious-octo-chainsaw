#!/usr/bin/env bash
# CloudMatrix MSSP — Deployment script
# Usage: ./infra/pipelines/deploy.sh <environment>

set -euo pipefail

ENVIRONMENT="${1:-dev}"
RESOURCE_GROUP="rg-cloudmatrix-${ENVIRONMENT}"
LOCATION="canadacentral"

echo "Deploying CloudMatrix to environment: ${ENVIRONMENT}"

# Build all services
pnpm run build

# Deploy infrastructure
az deployment group create \
  --resource-group "${RESOURCE_GROUP}" \
  --template-file infra/bicep/main.bicep \
  --parameters environment="${ENVIRONMENT}" location="${LOCATION}"

echo "Deployment complete."
