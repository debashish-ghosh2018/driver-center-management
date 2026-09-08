const {sequelize} = require("../models");
const {getAllSettings, setSetting} = require("../services/appSettings.service");

const ALLOWED_SETTINGS = {
  general: {companyName: "STRING", currency: "STRING"},
  notifications: {enabled: "BOOLEAN", bookingCreated: "BOOLEAN", driverAssigned: "BOOLEAN", bookingStatusChanged: "BOOLEAN"},
  email: { enabled: "BOOLEAN", fromName: "STRING", fromEmail: "STRING"},
  sms: {enabled: "BOOLEAN", provider: "STRING"},
  whatsapp: {enabled: "BOOLEAN", provider: "STRING"},
  driverCommission: {type: "STRING", value: "NUMBER", includeAllowances: "BOOLEAN"}
};


/*
 * GET /api/admin/settings
 */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await getAllSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};


/*
 * PUT /api/admin/settings
 */
exports.updateSettings = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const input = req.body;

    for (const [group, fields] of Object.entries(input)) {
      if (!ALLOWED_SETTINGS[group]) {
        continue;
      }

      for (const [key,value] of Object.entries(fields || {})) {
        const valueType = ALLOWED_SETTINGS[group][key];

        if (!valueType) {
          continue;
        }

        /*
         * Commission validation.
         */
        if (group === "driverCommission" && key === "type" && !["PERCENTAGE","FIXED"].includes(value)) {
          await transaction.rollback();
          return res.status(400).json({message: "Invalid commission type"});
        }

        if (group === "driverCommission" && key === "value") {
          const number = Number(value);
          if (!Number.isFinite(number) || number < 0) {
            await transaction.rollback();
            return res.status(400).json({message: "Invalid commission value"});
          }
        }

        await setSetting({group, key, value, valueType, transaction});
      }
    }

    await transaction.commit();
    const settings = await getAllSettings();

    return res.json({message: "Application settings updated", settings});

  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};