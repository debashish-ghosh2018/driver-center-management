"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("app_settings", {
      id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
      group: {type: Sequelize.STRING(50), allowNull: false},
      key: {type: Sequelize.STRING(100), allowNull: false},
      value: {type: Sequelize.TEXT("long"), allowNull: true},
      valueType: {type: Sequelize.ENUM("STRING","NUMBER","BOOLEAN","JSON"), allowNull: false, defaultValue: "STRING"},
      description: {type: Sequelize.STRING(500), allowNull: true},
      isPublic: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false},
      createdAt: {type: Sequelize.DATE, allowNull: false},
      updatedAt: {type: Sequelize.DATE, allowNull: false}
    });

    await queryInterface.addConstraint("app_settings", {fields: ["group", "key"], type: "unique", name: "uq_app_settings_group_key"});
  },
  async down(queryInterface) {
    await queryInterface.dropTable("app_settings");
  }
};