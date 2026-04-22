import { getAlertThreshold } from "@/utils/health-status";

describe('Health Utility', () => {
  it('doit renvoyer CRITICAL si 7 jours', () => {
    expect(getAlertThreshold(7)).toBe('CRITICAL');
  });

  it('doit renvoyer WARNING si 14 jours', () => {
    expect(getAlertThreshold(14)).toBe('WARNING');
  });

  it('doit renvoyer INFO si 30 jours', () => {
    expect(getAlertThreshold(30)).toBe('INFO');
  });

  it('doit renvoyer NONE si différent de 7-14-30', () => {
    expect(getAlertThreshold(4)).toBe('NONE');
  });

  it('doit renvoyer NONE si null', () => {
    expect(getAlertThreshold(null)).toBe('NONE');
  });
});