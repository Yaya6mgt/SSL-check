import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'alert_threshold_settings', underscored: true })
export class AlertThresholdSetting extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 7 })
  declare criticalDays: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 14 })
  declare warningDays: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 30 })
  declare infoDays: number;
}