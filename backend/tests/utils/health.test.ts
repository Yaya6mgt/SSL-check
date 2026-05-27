import { AlertThresholds, getAlertThreshold } from "@/utils/health-status";

describe('Health Utility', () => {
  it('doit renvoyer CRITICAL si <= 7 jours', () => {
    expect(getAlertThreshold(7)).toBe(AlertThreshold.CRITICAL);
  });

  it('doit renvoyer WARNING si <= 14 jours', () => {
    expect(getAlertThreshold(14)).toBe(AlertThreshold.WARNING);
  });

  it('doit renvoyer INFO si < 30 jours', () => {
    expect(getAlertThreshold(30)).toBe(AlertThreshold.INFO);
  });

  it('doit renvoyer CRITICAL si null', () => {
    expect(getAlertThreshold(null)).toBe(AlertThreshold.CRITICAL);
  });
});