const {getGroup} = require("./appSettings.service");

async function sendSms({to, message}) {
  const settings = await getGroup("sms");

  if (!settings.enabled) {
    return {skipped: true, reason: "SMS disabled"};
  }

  if (!to) {
    return {skipped: true, reason: "Mobile number missing"};
  }

  switch (settings.provider) {
    /*
     * Add providers here.
     *
     * Example:
     * MSG91
     * Twilio
     * AWS SNS
     */
    case "TWILIO":
      return sendViaTwilio(to, message);
    default:
      console.log("SMS:", to, message);
      return {simulated: true};
  }
}

async function sendViaTwilio(to, message) {
  const twilio = require("twilio");
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  return client.messages.create({from: process.env.TWILIO_PHONE_NUMBER, to, body: message});
}

module.exports = {sendSms};