/*
const jwt = require("jsonwebtoken");

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
}

module.exports = { createToken };
*/

const jwt = require("jsonwebtoken");

function createToken(user) {
  return jwt.sign(
    {id: user.id, name: user.name, email: user.email, role: user.role, customerId: user.customerId || null, driverId: user.driverId || null},
    process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN || "1d"}
  );
}

module.exports = {createToken};