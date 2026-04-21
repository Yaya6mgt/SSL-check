import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@/config/db';
import { Domain } from './Domain';

export class SslCheck extends Model {
  declare id: number;
  declare isValid: boolean;
  declare validTo: Date | null;
  declare issuer: string | null;
  declare errorMessage: string | null;
  declare lastCheck: Date;
}

SslCheck.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  isValid: { type: DataTypes.BOOLEAN, allowNull: false },
  validTo: { type: DataTypes.DATE, allowNull: true },
  issuer: { type: DataTypes.STRING, allowNull: true },
  errorMessage: { type: DataTypes.TEXT, allowNull: true },
  lastCheck: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { sequelize, tableName: 'ssl_checks' });

Domain.hasMany(SslCheck, { foreignKey: 'domainId', as: 'checks' });
SslCheck.belongsTo(Domain, { foreignKey: 'domainId' });