const { Driver } = require("../models");
const { createCrud } = require("./crud.controller");

const crud = createCrud(Driver);

exports.list = crud.list;
exports.get = crud.get;
exports.create = async (req, res, next) => {
  req.body.driverCode ||= `DRV-${Date.now()}`;
  crud.create(req, res, next);
};
exports.update = crud.update;
exports.remove = crud.remove;

exports.availability = async (req, res, next) => {
  try {
    const driver = await Driver.findByPk(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    const allowed = ["AVAILABLE", "BUSY", "OFFLINE"];
    if (!allowed.includes(req.body.availability)) return res.status(400).json({ message: "Invalid availability" });
    driver.availability = req.body.availability;
    await driver.save();
    res.json(driver);
  } catch (e) { next(e); }
};
