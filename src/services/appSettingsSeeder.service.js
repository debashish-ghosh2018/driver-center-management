const {setSetting} = require("./appSettings.service");

async function seedAppSettings() {
  /*
   * General
   */
  await setSetting({group: "general", key: "companyName", value: "Driver Center Management", valueType: "STRING"});
  await setSetting({group: "general", key: "currency", value: "INR", valueType: "STRING"});

  /*
   * Notification master switch
   */
  await setSetting({group: "notifications", key: "enabled", value: true, valueType: "BOOLEAN"});
  await setSetting({group: "notifications", key: "bookingCreated", value: true, valueType: "BOOLEAN"});
  await setSetting({group: "notifications", key: "driverAssigned", value: true, valueType: "BOOLEAN"});
  await setSetting({group: "notifications", key: "bookingStatusChanged", value: true, valueType: "BOOLEAN"});

  /*
   * Email
   */
  await setSetting({group: "email", key: "enabled", value: false, valueType: "BOOLEAN"});
  await setSetting({group: "email", key: "fromName", value: "Driver Center", valueType: "STRING"});
  await setSetting({group: "email", key: "fromEmail", value: "noreply@example.com", valueType: "STRING"});

  /*
   * SMS
   */
  await setSetting({group: "sms", key: "enabled", value: false, valueType: "BOOLEAN"});
  await setSetting({ group: "sms", key: "provider", value: "NONE", valueType: "STRING"});

  /*
   * WhatsApp
   */
  await setSetting({group: "whatsapp", key: "enabled", value: false, valueType: "BOOLEAN"});
  await setSetting({group: "whatsapp", key: "provider", value: "NONE", valueType: "STRING"});

  /*
   * Commission
   */
  await setSetting({group: "driverCommission", key: "type", value: "PERCENTAGE", valueType: "STRING"});
  await setSetting({group: "driverCommission", key: "value", value: 10, valueType: "NUMBER"});
  await setSetting({group: "driverCommission", key: "includeAllowances", value: false, valueType: "BOOLEAN"});
}

module.exports = {seedAppSettings};