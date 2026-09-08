const {Customer,Driver,User} = require("../models");
const {dispatchNotification} = require("./notification.service");
const {getGroup} = require("./appSettings.service");

function bookingRoute(booking) {
  return `${booking.pickupLocation} → ${booking.dropLocation}`;
}

async function notifyBookingCreated(booking) {
  const config = await getGroup("notifications");

  if (!config.bookingCreated) {
    return;
  }

  const customer = await Customer.findByPk(booking.customerId,{include: [{model: User, as: "user", required: false}]});
  if (!customer) {
    return;
  }

  const title = `Booking ${booking.bookingNo} created`;
  const message = `${booking.tripCategory === "OUTSTATION" ? "Outstation" : "Local"} booking created for ${bookingRoute(booking)} on ${booking.pickupDate}.`;

  await dispatchNotification({
    userId: customer.userId,
    email: customer.email || customer.user?.email,
    mobile: customer.mobile,
    title,
    message,
    type: "BOOKING_CREATED",
    referenceType: "BOOKING",
    referenceId: booking.id
  });
}

async function notifyDriverAssigned(booking, driver) {
  const config = await getGroup("notifications");

  if (!config.driverAssigned) {
    return;
  }

  const driverWithUser = await Driver.findByPk(driver.id,{include: [{model: User, as: "user", required: false}]});
  const title = `New booking assigned`;
  const message = `Booking ${booking.bookingNo}: ${bookingRoute(booking)}, pickup ${booking.pickupDate} ${booking.pickupTime}.`;

  await dispatchNotification({
    userId: driverWithUser ?.userId,
    email: driverWithUser ?.email || driverWithUser ?.user?.email,
    mobile: driverWithUser ?.mobile,
    title,
    message,
    type: "DRIVER_ASSIGNED",
    referenceType: "BOOKING",
    referenceId: booking.id
  });
}

async function notifyStatusChanged(booking) {
  const config = await getGroup("notifications");
  if (!config.bookingStatusChanged) {
    return;
  }

  const customer = await Customer.findByPk(booking.customerId,{include: [{model: User, as: "user", required: false}]});
  if (!customer) {
    return;
  }

  await dispatchNotification({
    userId: customer.userId,
    email: customer.email || customer.user?.email,
    mobile: customer.mobile,
    title: `Booking ${booking.bookingNo} updated`,
    message: `Your booking status is now ${booking.status}.`,
    type: "BOOKING_STATUS",
    referenceType: "BOOKING",
    referenceId: booking.id
  });
}

module.exports = {notifyBookingCreated,notifyDriverAssigned,notifyStatusChanged};