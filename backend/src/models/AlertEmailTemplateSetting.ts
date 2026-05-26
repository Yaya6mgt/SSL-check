import { Table, Column, Model, DataType } from 'sequelize-typescript';
import type { CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { Col } from 'sequelize/lib/utils';

@Table({ tableName: 'alert_email_template_settings', underscored: true })
export class AlertEmailTemplateSetting extends Model<InferAttributes<AlertEmailTemplateSetting>, InferCreationAttributes<AlertEmailTemplateSetting>> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: CreationOptional<number>;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'Récapitulatif des alertes SSL' })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: false, defaultValue: 'Les domaines suivants nécessitent une action :' })
  declare introText: string;

  @Column({ type: DataType.STRING(7), allowNull: false, defaultValue: '#0f172a' })
  declare primaryColor: string;

  @Column({ type: DataType.STRING(7), allowNull: false, defaultValue: '#000000' })
  declare introColor: string;

  @Column({ type: DataType.STRING(7), allowNull: false, defaultValue: '#eeeeee' })
  declare headerBackgroundColor: string;

  @Column({ type: DataType.STRING(7), allowNull: false, defaultValue: '#000000' })
  declare headerTextColor: string;

  @Column({ type: DataType.STRING(7), allowNull: false, defaultValue: '#e0e0e0' })
  declare borderColor: string;
}