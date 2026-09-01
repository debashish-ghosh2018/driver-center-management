const { Vehicle } = require("../models");
const { createCrud } = require("./crud.controller");

const crud = createCrud(Vehicle);
exports.list = crud.list;
exports.get = crud.get;
exports.create = crud.create;
exports.update = crud.update;
exports.remove = crud.remove;
exports.disable = crud.disable;
