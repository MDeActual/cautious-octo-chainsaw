import { Router, type Router as ExpressRouter, type Request, type Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import type { AdminConsentUrlResponse, ApiResponse } from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';
import { loadConfig } from '../config.js';

export const consentRouter: ExpressRouter = Router();
const logger = createLogger({ service: 'identity-service' });

const ConsentRequestSchema = z.object({
  customer_tenant_id: z.string().uuid('customer_tenant_id must be a valid UUID'),
  redirect_uri: z.string().url('redirect_uri must be a valid URL').optional(),
});

/**
 * POST /consent/admin-consent-url
 *
 * Generates an Entra ID admin consent URL for onboarding a customer tenant.
 * The customer's Global Administrator opens this URL to grant the CloudMatrix
 * service principal the required Graph API permissions.
 *
 * Request body:
 *   { customer_tenant_id: string, redirect_uri?: string }
 *
 * Response:
 *   { consent_url: string, state: string, tenant_id: string }
 *
 * The `state` parameter is a random UUID that the caller must persist and
 * verify on the redirect to prevent CSRF attacks.
 */
consentRouter.post('/consent/admin-consent-url', (req: Request, res: Response) => {
  const parse = ConsentRequestSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ data: null, error: parse.error.message });
    return;
  }

  const config = loadConfig();
  const { customer_tenant_id, redirect_uri } = parse.data;

  if (!config.entraClientId) {
    res.status(500).json({
      data: null,
      error: 'ENTRA_CLIENT_ID is not configured on the identity service',
    });
    return;
  }

  const state = uuidv4();
  const defaultRedirectUri = `${
    process.env['PUBLIC_BASE_URL'] ?? 'https://app.securepulse.ca'
  }/app/onboarding/consent-callback`;

  const params = new URLSearchParams({
    client_id: config.entraClientId,
    response_type: 'code',
    redirect_uri: redirect_uri ?? defaultRedirectUri,
    scope: 'https://graph.microsoft.com/.default',
    state,
    prompt: 'admin_consent',
  });

  const consentUrl = `https://login.microsoftonline.com/${customer_tenant_id}/adminconsent?${params.toString()}`;

  logger.info('Generated admin consent URL', {
    customer_tenant_id,
    state,
  });

  const response: ApiResponse<AdminConsentUrlResponse> = {
    data: { consent_url: consentUrl, state, tenant_id: customer_tenant_id },
    error: null,
  };
  res.json(response);
});

/**
 * GET /consent/callback
 *
 * Handles the redirect from Entra ID after admin consent.
 * The caller should verify the `state` parameter against the persisted value.
 * On success, the customer tenant is ready for assessment.
 *
 * Query params: tenant (tenant ID), admin_consent ('True'/'False'), state
 */
consentRouter.get('/consent/callback', (req: Request, res: Response) => {
  const { tenant, admin_consent, state, error, error_description } = req.query;

  if (error) {
    logger.warn('Admin consent declined or failed', { error, error_description });
    res.status(400).json({
      data: null,
      error: `Admin consent failed: ${String(error_description ?? error)}`,
    });
    return;
  }

  if (admin_consent !== 'True') {
    res.status(400).json({ data: null, error: 'Admin consent was not granted' });
    return;
  }

  logger.info('Admin consent granted', { tenant, state });

  res.json({
    data: {
      tenant_id: tenant,
      consent_granted: true,
      state,
      message:
        'Admin consent successfully granted. The tenant can now be onboarded into SecurePulse.',
    },
    error: null,
  });
});
