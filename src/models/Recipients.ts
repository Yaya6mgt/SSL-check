import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'recipients' })
export class Recipient extends Model {
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;
}