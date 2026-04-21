import { DataTypes, Model } from "sequelize";
import { Server } from "./Server";
import { sequelize } from '@/config/db';

export class Domain extends Model {
  public id!: number;
  public hostname!: string;
  public serverId!: number;
}

Domain.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  hostname: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  serverId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
}, {
  sequelize,
  tableName: 'domains'
});

Server.hasMany(Domain);
Domain.belongsTo(Server);