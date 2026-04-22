import { getAlertLevel } from "@/utils/health-status";

describe('Health Utility', () => {
  it('doit renvoyer HIGH si moins de 7 jours', () => {
    expect(getAlertLevel(5, true)).toBe('HIGH');
  });

  it('doit renvoyer MEDIUM si entre 7 et 21 jours', () => {
    expect(getAlertLevel(15, true)).toBe('MEDIUM');
  });
});