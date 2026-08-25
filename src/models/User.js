const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcryptjs");

class User extends Model {
  static initModel(sequelize) {
    User.init({
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },
      role: {
        type: DataTypes.ENUM("SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "DRIVER", "CUSTOMER"),
        defaultValue: "ADMIN"
      },
      status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE"), defaultValue: "ACTIVE" }
    }, {
      sequelize, modelName: "User", tableName: "users", timestamps: true,
      defaultScope: { attributes: { exclude: ["passwordHash"] } }
    });
    return User;
  }

  async checkPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }

  static async seedAdmin() {
    const existing = await User.unscoped().findOne({ where: { email: "admin@drivercenter.local" } });
    if (!existing) {
      const passwordHash = await bcrypt.hash("Admin@12345", 12);
      await User.create({
        name: "System Administrator",
        email: "admin@drivercenter.local",
        passwordHash,
        role: "SUPER_ADMIN"
      });
    }
  }
}

module.exports = User;
