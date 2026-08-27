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
Booking.belongsTo(Customer, {foreignKey: "customerId"});
Driver.hasMany(Booking, {foreignKey: "driverId"});
Booking.belongsTo(Driver, {foreignKey: "driverId"});
Vehicle.hasMany(Booking, {foreignKey: "vehicleId"});
Booking.belongsTo(Vehicle, {foreignKey: "vehicleId"});
Booking.hasMany(Payment, {foreignKey: "bookingId"});
Payment.belongsTo(Booking, {foreignKey: "bookingId"});
Booking.hasMany(Rating, {foreignKey: "bookingId"});
Rating.belongsTo(Booking, {foreignKey: "bookingId"});
Driver.hasMany(Rating, {foreignKey: "driverId"});
Rating.belongsTo(Driver, {foreignKey: "driverId"});
Driver.hasMany(DriverLocation, {foreignKey: "driverId"});
DriverLocation.belongsTo(Driver, {foreignKey: "driverId"});
Driver.hasMany(DriverEarning, {foreignKey: "driverId"});
DriverEarning.belongsTo(Driver, {foreignKey: "driverId"});
Booking.hasOne(DriverEarning, {foreignKey: "bookingId"});
DriverEarning.belongsTo(Booking, {foreignKey: "bookingId"});
Permission.hasMany(RolePermission, {foreignKey: "permissionId"});
RolePermission.belongsTo(Permission, {foreignKey: "permissionId"});

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