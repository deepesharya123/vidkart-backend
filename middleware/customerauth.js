const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");

const customerAuth = async function (req, res, next) {
  console.log("customer auth", req.body);
  try {
    // const token = req.cookies["auth_token"];
    const token = req.body.token;
    console.log("token again form custoemr auth", {
      token,
    });

    const decoded = jwt.verify(token, process.env.JWT_ACC_KEY);
    const customer = await Customer.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!customer) {
      console.log("NO authorization for this customer");
    }

    console.log("I am here in the cusotmer auth");
    req.customer = customer;
    // console.log(req.customer)
    req.token = token;
    next();
  } catch (e) {
    console.log(e);
  }
};

module.exports = customerAuth;
