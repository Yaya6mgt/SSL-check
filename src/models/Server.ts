import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/config/db';

export class Server extends Model {
  declare id: number;
  declare name: string;
  declare ipAddress: string;
}

Server.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isIP: true }
  },
}, {
  sequelize,
  tableName: 'servers'
});