import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import { hashPassword } from '@/utils/auth.utils';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare firstName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare lastName: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({
    type: DataType.ENUM('admin', 'editor', 'viewer'),
    defaultValue: 'viewer',
    allowNull: false
  })
  declare role: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;

  @Column({ type: DataType.DATE })
  declare lastLogin: Date;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      instance.password = await hashPassword(instance.password);
    }
  }
}