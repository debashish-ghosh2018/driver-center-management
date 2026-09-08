const {getGroup} = require("./appSettings.service");

async function sendWhatsApp({to, message}) {
  const settings = await getGroup("whatsapp");

  if (!settings.enabled) {
    return {skipped: true, reason: "WhatsApp disabled"};
  }

  if (!to) {
    return {skipped: true, reason: "Mobile number missing"};
  }

  if (settings.provider === "TWILIO") {
    const twilio = require("twilio");
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    return client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${to}`,
      body: message
    });
  }

  console.log("WhatsApp:", to, message);

  return {simulated: true};
}

module.exports = {sendWhatsApp};