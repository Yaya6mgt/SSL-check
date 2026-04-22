import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Domain } from './Domain';

@Table({ tableName: 'alerts' })
export class Alert extends Model {
  @ForeignKey(() => Domain)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare domainId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare level: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare sentAt: Date;

  @BelongsTo(() => Domain)
  declare domain: Domain;
}