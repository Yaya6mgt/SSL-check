import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Server } from './Server';
import { SslCheck } from './SslCheck';

@Table({ tableName: 'domains', underscored: true })
export class Domain extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare hostname: string;

  @ForeignKey(() => Server)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare serverId: number;

  @BelongsTo(() => Server)
  declare server: Server;

  @HasMany(() => SslCheck)
  declare checks: SslCheck[];
}