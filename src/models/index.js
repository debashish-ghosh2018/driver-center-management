const sequelize = require("../config/db");
const User = require("./User"),
    Customer = require("./Customer"),
    Driver = require("./Driver"),
    Vehicle = require("./Vehicle"),
    Booking = require("./Booking"),
    Payment = require("./Payment"),
    Rating = require("./Rating"),
    DriverLocation = require("./DriverLocation"),
    Notification = require("./Notification"),
    AuditLog = require("./AuditLog"),
    DriverEarning = require("./DriverEarning");

// ACL
const Permission = require("./Permission");
const RolePermission = require("./RolePermission");


[User, Customer, Driver, Vehicle, Booking, Payment, Rating, DriverLocation, Notification, AuditLog, DriverEarning, Permission, RolePermission].forEach(M => M.initModel(sequelize));
Customer.hasMany(Booking, {foreignKey: "customerId"});
Customer.belongsTo(User, {foreignKey: "userId", as: "user"});
Driver.hasMany(Booking, {foreignKey: "driverId"});
Driver.hasMany(Rating, {foreignKey: "driverId"});
Driver.hasMany(DriverLocation, {foreignKey: "driverId"});
Driver.hasMany(DriverEarning, {foreignKey: "driverId"});
Driver.belongsTo(User, {foreignKey: "userId", as: "user"});
Vehicle.hasMany(Booking, {foreignKey: "vehicleId"});
Booking.belongsTo(Driver, {foreignKey: "driverId"});
Booking.belongsTo(Customer, {foreignKey: "customerId"});
Booking.belongsTo(Vehicle, {foreignKey: "vehicleId"});
Booking.hasMany(Payment, {foreignKey: "bookingId"});
Booking.hasMany(Rating, {foreignKey: "bookingId"});
Booking.hasOne(DriverEarning, {foreignKey: "bookingId"});
Payment.belongsTo(Booking, {foreignKey: "bookingId"});
Rating.belongsTo(Booking, {foreignKey: "bookingId"});
Rating.belongsTo(Driver, {foreignKey: "driverId"});
DriverLocation.belongsTo(Driver, {foreignKey: "driverId"});
DriverEarning.belongsTo(Driver, {foreignKey: "driverId"});
DriverEarning.belongsTo(Booking, {foreignKey: "bookingId"});
Permission.hasMany(RolePermission, {foreignKey: "permissionId"});
RolePermission.belongsTo(Permission, {foreignKey: "permissionId"});
User.hasOne(Customer, {foreignKey: "userId", as: "customerProfile"});
User.hasOne(Driver, {foreignKey: "userId", as: "driverProfile"});

module.exports = {
    sequelize,
    User,
    Customer,
    Driver,
    Vehicle,
    Booking,
    Payment,
    Rating,
    DriverLocation,
    Notification,
    AuditLog,
    DriverEarning,
    Permission,
    RolePermission
};