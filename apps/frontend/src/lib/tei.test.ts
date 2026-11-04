import { describe, expect, it } from 'vitest';
import { calculateTei, type TeiInputs } from './tei';
const composite: TeiInputs = {users:150,userHourly:42,itHourly:63,retiredConference:39600,retiredAntivirus:22500,amortizedServers:7000,amortizedStorage:4000,retiredMsp:50000,licenseHoursMonthly:15,serverHoursMonthly:8,collaborationHoursWeekly:1,storageHoursWeekly:.5,productivityRecapture:.5,onboardingHoursAnnual:130,managementHoursAnnual:240,helpdeskHoursAnnual:280,patchHoursAnnual:36,licenses:[{count:0,monthlyPrice:6},{count:100,monthlyPrice:12.5},{count:50,monthlyPrice:22},{count:20,monthlyPrice:12}],consultancy:30000,migrationHours:40,setupHours:120,trainingHours:2,itStaff:2,managementFraction:.2,annualItSalary:131040};
describe('source-specific TEI scenario', () => {
  it('reproduces report composite within dollar rounding', () => {
    const result = calculateTei(composite);
    expect(Math.round(result.netPresentValue)).toBe(630573);
    expect(Math.round(result.roi! * 100)).toBe(223);
    expect(result.scope).toBe('microsoft-365-adoption');
    expect(result.years).toHaveLength(3);
  });
  it('does not assume displaced MSP savings', () => {
    expect(calculateTei({...composite, retiredMsp:0}).technologySavings).toBe(calculateTei(composite).technologySavings - 42500);
  });
  it.each([-1, NaN, Infinity])('rejects invalid amounts %s', value => {
    expect(() => calculateTei({...composite, consultancy:value})).toThrow();
  });
  it('rejects invalid fractions/counts and overflow', () => {
    expect(() => calculateTei({...composite, productivityRecapture:1.1})).toThrow();
    expect(() => calculateTei({...composite, users:1.5})).toThrow();
    expect(() => calculateTei({...composite, userHourly:Number.MAX_VALUE})).toThrow();
  });
  it('returns undefined ROI as null when there are no costs', () => {
    const result = calculateTei({...composite, licenses:[], consultancy:0,migrationHours:0,setupHours:0,trainingHours:0,itStaff:0});
    expect(result.roi).toBeNull();
  });
});
