import {
  normalizeScore,
  calculateRiskLevel,
  calculateOpportunityScore,
  calculateLeadRank,
} from '../src/scoring';

describe('normalizeScore', () => {
  it('returns 42 for normalizeScore(42, 100)', () => {
    expect(normalizeScore(42, 100)).toBe(42);
  });

  it('returns 0 for normalizeScore(0, 100)', () => {
    expect(normalizeScore(0, 100)).toBe(0);
  });

  it('returns 100 for normalizeScore(100, 100)', () => {
    expect(normalizeScore(100, 100)).toBe(100);
  });

  it('returns 0 for normalizeScore(50, 0) — edge case: zero max', () => {
    expect(normalizeScore(50, 0)).toBe(0);
  });
});

describe('calculateRiskLevel', () => {
  it('returns "Low" for 80', () => {
    expect(calculateRiskLevel(80)).toBe('Low');
  });

  it('returns "Medium" for 50', () => {
    expect(calculateRiskLevel(50)).toBe('Medium');
  });

  it('returns "High" for 49', () => {
    expect(calculateRiskLevel(49)).toBe('High');
  });
});

describe('calculateOpportunityScore', () => {
  it('returns 58 for calculateOpportunityScore(42)', () => {
    expect(calculateOpportunityScore(42)).toBe(58);
  });
});

describe('calculateLeadRank', () => {
  it('returns "Hot" for High risk with opportunityScore 50', () => {
    expect(calculateLeadRank('High', 50)).toBe('Hot');
  });

  it('returns "Warm" for Medium risk with opportunityScore 60', () => {
    expect(calculateLeadRank('Medium', 60)).toBe('Warm');
  });

  it('returns "Cold" for Low risk with opportunityScore 20', () => {
    expect(calculateLeadRank('Low', 20)).toBe('Cold');
  });
});
