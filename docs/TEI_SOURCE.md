# TEI source verification

Verified 2026-11-04 against the user-supplied **The-TEI-of-Microsoft-365-For-Business-Study-2025.pdf**, February 2025, 43 pages. This is the canonical financial source for this implementation, not a model of SecurePulse efficacy.

- Publisher's full report: https://tei.forrester.com/go/Microsoft/365Business/docs/TheTEIOfMicrosoft365ForBusiness.pdf
- Microsoft-hosted full report: https://cdn-dynmedia-1.microsoft.com/is/content/microsoftcorp/microsoft/final/en-us/microsoft-brand/documents/The-TEI-of-Microsoft-365-For-Business-Study-2025.pdf
- The user-provided copy was checked against the full report. The copyrighted PDF is not redistributed in this repository.

## Scope and limitations

The Microsoft-commissioned Forrester study models Microsoft 365 adoption for a 150-employee US composite organization. Its results are illustrative, not promises for another customer. It does not establish a relationship between Secure Score and incident probability, monetary cyber exposure, insurance premiums, legal liability, or SecurePulse package effectiveness. Its risk adjustments concern uncertainty in cost and benefit estimates.

Do not present Microsoft 365's complete adoption benefit as an incremental benefit of purchasing SecurePulse, especially for a customer already using Microsoft 365. Do not infer benefits from missing data. User-entered scenarios must identify inputs and currency and remain distinct from the report's historical USD composite.

## Calculation rules

Pages 36–38 establish the three-year calculation convention:

- `PV = cashFlow[0] + sum(cashFlow[t] / (1 + discountRate)^t, t = 1..3)`.
- Time-zero flows are not discounted; annual flows occur at year end.
- `NPV = PV(benefits) - PV(costs)`.
- `ROI = NPV / PV(costs)`; show unavailable, not infinity, when cost PV is zero.
- Report assumption: annual discount rate 10%. Preserve full precision internally; round display only.
- Payback requires an explicitly stated timing model. Do not claim an exact month from annual totals without disclosing interpolation assumptions.

The scenario engine may accept disclosed user-entered benefit and cost cash flows without inventing their source. That is not equivalent to reproducing every component model below.

## Component formulas and source pages

All component names below are descriptive paraphrases. Multipliers reproduce the report's model and must not silently become customer defaults.

| Component | Formula before discounting | Source page |
| --- | --- | --- |
| A: legacy retirement savings | `(retiredConference + retiredAntivirus + amortizedServers + amortizedStorage + retiredMSP + (licenseHoursMonthly + serverHoursMonthly) * 12 * itHourly) * 0.85` | 18 |
| B: business-user productivity | `users * (collaborationHoursWeekly + storageHoursWeekly) * 52 * userHourly * productivityRecapture * 0.85` | 21 |
| C: IT productivity | `(onboardingHoursAnnual + managementHoursAnnual + helpdeskHoursAnnual + patchHoursAnnual) * itHourly * 0.90` | 24 |
| D: annual licensing cost | `12 * sum(licenseCount * monthlyPrice) * 1.05` | 32 |
| E: initial implementation/training | `(consultancy + (migrationHours + setupHours) * itHourly + trainingHours * users * userHourly) * 1.10` | 34 |
| F: annual ongoing management | `itStaff * managementFraction * annualSalary * 1.10` | 35 |

Only E occurs at time zero. A/B/C are annual benefits; D/F are annual costs. Avoid overlapping labor or retired-MSP savings. In particular, retired MSP cost is a benefit only where genuinely displaced; a new MSSP package's cost cannot be omitted.

## Reference validation fixture

The full report's summary (page 36) rounds to benefit PV **USD 913,063**, cost PV **USD 282,490**, NPV **USD 630,573**, and ROI **223%**. It reports payback below six months, not a guaranteed result.

An abridged Microsoft infographic displays USD 613K NPV, inconsistent with the full report. The full report is canonical. Historical license prices in the report must not be used as a current Canadian catalog or sales quote.

## Source and commercial presentation

Link to the publisher's report; do not assume permission to redistribute the entire copyrighted PDF publicly. Do not label this model as Forrester endorsement of SecurePulse. Sources and assumptions should remain visible beside outputs. Financial scenarios must not change access permissions, contract terms, responsibility assignments, or liability.
