/** Microsoft 365 adoption scenario only. Source: February 2025 Forrester TEI,
 * user-provided report, pp.18/21/24/32/34/35/36–38. Historical USD model.
 * Not a SecurePulse return, cyber-loss estimate, quote, or guarantee.
 */
export interface TeiInputs {
  users: number;
  userHourly: number;
  itHourly: number;
  retiredConference: number;
  retiredAntivirus: number;
  amortizedServers: number;
  amortizedStorage: number;
  retiredMsp: number;
  licenseHoursMonthly: number;
  serverHoursMonthly: number;
  collaborationHoursWeekly: number;
  storageHoursWeekly: number;
  productivityRecapture: number;
  onboardingHoursAnnual: number;
  managementHoursAnnual: number;
  helpdeskHoursAnnual: number;
  patchHoursAnnual: number;
  licenses: { count: number; monthlyPrice: number }[];
  consultancy: number;
  migrationHours: number;
  setupHours: number;
  trainingHours: number;
  itStaff: number;
  managementFraction: number;
  annualItSalary: number;
}
export const TEI_SOURCE = 'https://tei.forrester.com/go/Microsoft/365Business/docs/TheTEIOfMicrosoft365ForBusiness.pdf';
export const TEI_DISCOUNT_RATE = 0.10;
export const TEI_HORIZON_YEARS = 3;
function amount(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid nonnegative input: ${name}`);
  return value;
}
export function calculateTei(input: TeiInputs) {
  for (const [key, value] of Object.entries(input)) {
    if (key !== 'licenses') amount(value as number, key);
  }
  if (!Number.isInteger(input.users) || !Number.isInteger(input.itStaff)) throw new Error('People counts must be integers');
  if (input.productivityRecapture > 1 || input.managementFraction > 1) throw new Error('Fractions must be between 0 and 1');
  if (!Array.isArray(input.licenses)) throw new Error('License inputs required');
  const licenseAnnual = input.licenses.reduce((sum, license) => {
    amount(license.count, 'license count'); amount(license.monthlyPrice, 'license price');
    if (!Number.isInteger(license.count)) throw new Error('License counts must be integers');
    return sum + license.count * license.monthlyPrice * 12;
  }, 0);
  const technologySavings = (input.retiredConference + input.retiredAntivirus + input.amortizedServers + input.amortizedStorage + input.retiredMsp + (input.licenseHoursMonthly + input.serverHoursMonthly) * 12 * input.itHourly) * 0.85;
  const productivitySavings = input.users * (input.collaborationHoursWeekly + input.storageHoursWeekly) * 52 * input.userHourly * input.productivityRecapture * 0.85;
  const adminSavings = (input.onboardingHoursAnnual + input.managementHoursAnnual + input.helpdeskHoursAnnual + input.patchHoursAnnual) * input.itHourly * 0.90;
  const licensingCost = licenseAnnual * 1.05;
  const initialCost = (input.consultancy + (input.migrationHours + input.setupHours) * input.itHourly + input.trainingHours * input.users * input.userHourly) * 1.10;
  const ongoingCost = input.itStaff * input.managementFraction * input.annualItSalary * 1.10;
  const annualBenefits = technologySavings + productivitySavings + adminSavings;
  const annualCosts = licensingCost + ongoingCost;
  const years = Array.from({length: TEI_HORIZON_YEARS}, (_, i) => {
    const year = i + 1;
    return {year, benefits: annualBenefits, costs: annualCosts, presentBenefits: annualBenefits / (1 + TEI_DISCOUNT_RATE) ** year, presentCosts: annualCosts / (1 + TEI_DISCOUNT_RATE) ** year};
  });
  const presentBenefits = years.reduce((sum, y) => sum + y.presentBenefits, 0);
  const presentCosts = initialCost + years.reduce((sum, y) => sum + y.presentCosts, 0);
  const netPresentValue = presentBenefits - presentCosts;
  const roi = presentCosts > 0 ? netPresentValue / presentCosts : null;
  const values = [technologySavings, productivitySavings, adminSavings, licensingCost, initialCost, ongoingCost, presentBenefits, presentCosts, netPresentValue];
  if (values.some(value => !Number.isFinite(value))) throw new Error('Scenario exceeds numeric range');
  return { technologySavings, productivitySavings, adminSavings, licensingCost, initialCost, ongoingCost, years, presentBenefits, presentCosts, netPresentValue, roi, currency: 'USD' as const, scope: 'microsoft-365-adoption' as const };
}
