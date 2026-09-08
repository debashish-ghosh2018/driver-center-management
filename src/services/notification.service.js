const {Notification} = require("../models"); 
const {sendEmail} = require("./email.service");
const {sendSms} = require("./sms.service");
const {sendWhatsApp} = require("./whatsapp.service");
const {getGroup} = require("./appSettings.service");

async function notifyBooking(b,title,message){
	return Notification.create({customerId:b.customerId, driverId:b.driverId || null, channel:"IN_APP", title, message, status:"SENT", sentAt:new Date()})
} 

async function createInAppNotification({userId,title,message,type = "INFO",referenceType = null,referenceId = null}) {
  if (!userId) {
    return null;
  }

  return Notification.create({userId,title,message,type,referenceType,referenceId,isRead: false});
}

async function dispatchNotification({userId,email,mobile,title,message,type = "INFO",referenceType = null,referenceId = null}) {
  const settings = await getGroup("notifications");

  if (!settings.enabled) {
    return {skipped: true};
  }

  const results = {};

  /*
   * In-app notification
   */
  results.inApp = await createInAppNotification({userId, title, message, type, referenceType, referenceId});

  /*
   * External notifications should
   * not make a booking API fail
   * if one provider is unavailable.
   */
  const jobs = [
  	sendEmail({to: email, subject: title, text: message}).then(result => {results.email = result;}).catch(error => {results.email = {error:error.message};}),
    sendSms({to: mobile, message}).then(result => {results.sms = result;}).catch(error => {results.sms = {error: error.message};}),
    sendWhatsApp({to: mobile, message}).then(result => {results.whatsapp = result;}).catch(error => {results.whatsapp = {error: error.message};})
  ];

  await Promise.allSettled(jobs);

  return results;
}

module.exports = {notifyBooking,createInAppNotification,dispatchNotification};







