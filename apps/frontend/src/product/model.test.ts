import { describe, expect, it } from "vitest";
import { services, canPurchase, scorePercentage } from "./model";
describe("honest product boundaries", () => {
  it("does not sell unapproved service concepts", () => {
    for (const service of services) {
      expect(canPurchase(service)).toBe(false);
      expect(service.price).toBeNull();
    }
  });
  it("never turns missing telemetry into a zero score", () => {
    expect(scorePercentage(undefined, undefined)).toBeNull();
    expect(scorePercentage(0, 0)).toBeNull();
    expect(scorePercentage(NaN, 100)).toBeNull();
  });
  it("accepts an evidenced zero and rejects invalid values", () => {
    expect(scorePercentage(0, 100)).toBe(0);
    expect(scorePercentage(30, 60)).toBe(50);
    expect(scorePercentage(101, 100)).toBeNull();
    expect(scorePercentage(-1, 100)).toBeNull();
  });
});
