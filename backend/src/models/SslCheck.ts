import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Domain } from './Domain';

@Table({ tableName: 'ssl_checks', underscored: true })
export class SslCheck extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare isValid: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  declare validTo: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  declare issuer: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare errorMessage: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare lastCheck: Date;

  @ForeignKey(() => Domain)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare domainId: number;

  @BelongsTo(() => Domain)
  declare domain: Domain;
}