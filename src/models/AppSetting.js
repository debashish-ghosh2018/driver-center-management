const { DataTypes, Model } = require("sequelize");

class AppSetting extends Model {
  static initModel(sequelize) {
    AppSetting.init(
      {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        group: {type: DataTypes.STRING(50), allowNull: false},
        key: {type: DataTypes.STRING(100), allowNull: false},
        value: {type: DataTypes.TEXT("long"), allowNull: true},
        valueType: {type: DataTypes.ENUM("STRING", "NUMBER", "BOOLEAN", "JSON"), allowNull: false, defaultValue: "STRING"},
        description: {type: DataTypes.STRING(500), allowNull: true},
        isPublic: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
      },
      {sequelize, modelName: "AppSetting", tableName: "app_settings", timestamps: true, indexes: [{unique: true, fields: ["group", "key"]}]}
    );

    return AppSetting;
  }
}

module.exports = AppSetting;