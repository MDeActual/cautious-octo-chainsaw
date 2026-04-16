import { Router, type Router as ExpressRouter } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '@cloudmatrix/shared-types';
import { createLogger } from '@cloudmatrix/logger';

export const summaryRouter: ExpressRouter = Router();
const logger = createLogger({ service: 'ai-service' });

const SummaryRequestSchema = z.object({
  score: z.number().min(0).max(100),
  riskLevel: z.enum(['Low', 'Medium', 'High']),
  recommendations: z.array(z.string()).optional().default([]),
});

type SummaryRequest = z.infer<typeof SummaryRequestSchema>;

interface SummaryResponse {
  summary: string;
}

/**
 * POST /summary — Generate a human-readable security summary
 *
 * Mock AI implementation for development. Does not access Microsoft Graph.
 * Does not execute any privileged actions.
 *
 * @input { score: number, riskLevel: string, recommendations: string[] }
 * @output { summary: string }
 */
summaryRouter.post('/', async (req, res) => {
  const parse = SummaryRequestSchema.safeParse(req.body);

  if (!parse.success) {
    const response: ApiResponse<null> = {
      data: null,
      error: parse.error.message,
    };
    res.status(400).json(response);
    return;
  }

  const { score, riskLevel, recommendations } = parse.data;

  logger.info('Generating security summary', { score, riskLevel });

  // Mock AI response generator - produces human-readable explanations
  const summary = generateMockSummary(score, riskLevel, recommendations);

  const response: ApiResponse<SummaryResponse> = {
    data: { summary },
    error: null,
  };

  res.json(response);
});

/**
 * Mock AI summary generator
 * Returns human-readable security posture explanations based on input metrics
 */
function generateMockSummary(
  score: number,
  riskLevel: SummaryRequest['riskLevel'],
  recommendations: string[]
): string {
  const riskDescription = getRiskDescription(riskLevel, score);
  const scoreContext = getScoreContext(score);
  const recommendationText = getRecommendationText(recommendations);

  return `${riskDescription} ${scoreContext} ${recommendationText}`.trim();
}

function getRiskDescription(riskLevel: string, score: number): string {
  switch (riskLevel) {
    case 'High':
      return `Your current security score of ${score}% indicates significant vulnerabilities that require immediate attention.`;
    case 'Medium':
      return `Your security score of ${score}% shows moderate risk. There are important areas that need improvement to strengthen your security posture.`;
    case 'Low':
      return `Your security score of ${score}% reflects a strong security posture with minimal risk exposure.`;
    default:
      return `Security score: ${score}%.`;
  }
}

function getScoreContext(score: number): string {
  if (score >= 80) {
    return 'Your organization is well-protected with robust security controls in place.';
  } else if (score >= 50) {
    return 'Your organization has basic security measures, but there are gaps that could be exploited.';
  } else {
    return 'Critical security controls are missing, leaving your organization vulnerable to threats.';
  }
}

function getRecommendationText(recommendations: string[]): string {
  if (recommendations.length === 0) {
    return 'Continue monitoring your security posture regularly.';
  }

  const topRecommendations = recommendations.slice(0, 3);

  if (topRecommendations.length === 1) {
    return `Priority action: ${topRecommendations[0]}.`;
  }

  const recList = topRecommendations
    .map((rec, idx) => `${idx + 1}. ${rec}`)
    .join('; ');

  return `Top priorities for improvement: ${recList}.`;
}
