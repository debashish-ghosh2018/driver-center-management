const {AppSetting} = require("../models");

function serializeValue(value, valueType) {
  if (valueType === "JSON") {
    return JSON.stringify(value ?? {});
  }

  if (valueType === "BOOLEAN") {
    return value ? "true" : "false";
  }

  return String(value ?? "");
}

function deserializeValue(value,valueType) {
  switch (valueType) {
    case "NUMBER":
      return Number(value);
    case "BOOLEAN":
      return value === "true";
    case "JSON":
      try {
        return JSON.parse(value || "{}");
      } catch {
        return {};
      }
    default:
      return value;
  }
}

async function getSetting(group,key,fallback = null) {
  const setting = await AppSetting.findOne({where: {group,key}});

  if (!setting) {
    return fallback;
  }

  return deserializeValue(setting.value,setting.valueType);
}

async function setSetting({group,key,value,valueType = "STRING",description = null,isPublic = false,transaction = null}) {
  const serialized = serializeValue(value,valueType);
  const [setting] = await AppSetting.findOrCreate({where: {group,key},defaults: {value: serialized,valueType,description,isPublic},transaction});

  await setting.update({value: serialized,valueType,description: description ?? setting.description,isPublic},{transaction});
  return setting;
}

async function getGroup(group) {
  const settings = await AppSetting.findAll({where: {group},order: [["key", "ASC"]]});
  const result = {};

  for (const setting of settings) {
    result[setting.key] = deserializeValue(setting.value, setting.valueType);
  }

  return result;
}

async function getAllSettings() {
  const rows = await AppSetting.findAll({order: [["group","ASC"],["key","ASC"]]});
  const result = {};

  for (const row of rows) {
    if (!result[row.group]) {
      result[row.group] = {};
    }

    result[row.group][row.key] = deserializeValue(row.value, row.valueType);
  }

  return result;
}

module.exports = {getSetting,setSetting,getGroup,getAllSettings,serializeValue,deserializeValue};