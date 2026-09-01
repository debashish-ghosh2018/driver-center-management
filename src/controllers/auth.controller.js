const { User, Customer, Driver } = require("../models");
const { createToken } = require("../utils/token");

/*
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.unscoped().findOne({ where: { email } });
    if (!user || user.status !== "ACTIVE" || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: createToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { next(err); }
};
*/

exports.login = async (req, res, next) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.unscoped().findOne({ where: { email } });
    if (!user || user.status !== "ACTIVE" || !(await user.checkPassword(password))) {
      return res.status(401).json({message: "Invalid credentials"});
    }

    let customerId = null;
    let driverId = null;

    if (user.role === "CUSTOMER") {
      const customer = await Customer.findOne({ where: {userId: user.id} });
      customerId = customer?.id || null;
    }

    if (user.role === "DRIVER") {
      const driver = await Driver.findOne({where: {userId: user.id}});
      driverId = driver?.id || null;
    }

    const authUser = {id: user.id, name: user.name, email: user.email, role: user.role, customerId, driverId};

    res.json({
      token: createToken(authUser),
      user: authUser
    });
  } catch (error) {
    next(error);
  }
};