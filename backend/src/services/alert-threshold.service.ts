import { AlertThresholdSetting } from '@/models/AlertThresholdSetting';
import { DEFAULT_ALERT_THRESHOLDS, normalizeAlertThresholds, type AlertThresholds } from '@/utils/health-status';

type AlertThresholdInput = {
  criticalDays?: number;
  warningDays?: number;
  infoDays?: number;
};

export class AlertThresholdService {
  static async getCurrentThresholds(): Promise<AlertThresholds> {
    const setting = await this.getOrCreateSetting();

    return this.toThresholds(setting);
  }

  static async updateThresholds(input: AlertThresholdInput): Promise<AlertThresholds> {
    const criticalDays = Number(input.criticalDays);
    const warningDays = Number(input.warningDays);
    const infoDays = Number(input.infoDays);

    this.assertValidThresholds({ criticalDays, warningDays, infoDays });

    const setting = await this.getOrCreateSetting();

    await setting.update({
      criticalDays,
      warningDays,
      infoDays,
    });

    return this.toThresholds(setting);
  }

  static async getOrCreateSetting(): Promise<AlertThresholdSetting> {
    let setting = await AlertThresholdSetting.findOne();

    if (!setting) {
      setting = await AlertThresholdSetting.create({
        criticalDays: DEFAULT_ALERT_THRESHOLDS.critical,
        warningDays: DEFAULT_ALERT_THRESHOLDS.warning,
        infoDays: DEFAULT_ALERT_THRESHOLDS.info,
      });
    }

    return setting;
  }

  static toThresholds(setting: AlertThresholdSetting): AlertThresholds {
    return normalizeAlertThresholds({
      critical: setting.criticalDays,
      warning: setting.warningDays,
      info: setting.infoDays,
    });
  }

  static assertValidThresholds({ criticalDays, warningDays, infoDays }: { criticalDays: number; warningDays: number; infoDays: number; }) {
    const values = [criticalDays, warningDays, infoDays];

    if (values.some(value => !Number.isInteger(value) || value <= 0)) {
      throw new Error('Les seuils doivent être des entiers strictement positifs.');
    }

    if (!(criticalDays < warningDays && warningDays < infoDays)) {
      throw new Error('Les seuils doivent respecter l ordre suivant : critique < danger < sain.');
    }
  }
}