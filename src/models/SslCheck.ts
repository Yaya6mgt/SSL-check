import { Model } from "sequelize";

export class SslCheck extends Model {
  public isValid!: boolean;
  public validTo!: Date;
  public issuer!: string;
  public lastCheck!: Date;
}
