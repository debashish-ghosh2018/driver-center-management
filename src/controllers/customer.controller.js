const { Customer } = require("../models");
const { createCrud } = require("./crud.controller");

const crud = createCrud(Customer);

exports.list = crud.list;
exports.get = crud.get;
exports.create = async (req, res, next) => {
  req.body.customerCode ||= `CUS-${Date.now()}`;
  crud.create(req, res, next);
};
exports.update = crud.update;
exports.remove = crud.remove;
exports.disable = crud.disable;
