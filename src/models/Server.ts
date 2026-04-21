import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/config/db';

export class Server extends Model {
  public id!: number;
  public name!: string;
  public ipAddress!: string;
}

Server.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  ipAddress: { type: DataTypes.STRING, allowNull: false },
}, { sequelize, modelName: 'server' });