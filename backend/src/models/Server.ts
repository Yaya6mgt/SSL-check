import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Domain } from './Domain';

@Table({ tableName: 'servers', underscored: true })
export class Server extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare ipAddress: string;

  @HasMany(() => Domain, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  })
  declare domains: Domain[];
}