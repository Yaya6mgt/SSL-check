import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Server } from './Server';
import { SslCheck } from './SslCheck';
import { Alert } from './Alert';

@Table({ tableName: 'domains', underscored: true })
export class Domain extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: 'domains_hostname_unique' })
  declare hostname: string;

  @ForeignKey(() => Server)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare serverId: number;

  @BelongsTo(() => Server)
  declare server: Server;

  @HasMany(() => SslCheck, { onDelete: 'CASCADE', hooks: true })
  declare checks: SslCheck[];

  @HasMany(() => Alert, { onDelete: 'CASCADE', hooks: true })
  declare alerts: Alert[];
}