const Seller = require("../models/seller");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    console.log("req.cookies", req.cookies);
    // const token = req.cookies["auth_token"];
    const token = req.cookies.auth_token;
    console.log("token again form authseller", {
      token,
    });

    const decoded = jwt.verify(token, process.env.JWT_ACC_KEY);

    const seller = await Seller.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!seller) {
      throw new Error("NO user found");
    }

    req.token = token;
    req.seller = seller;
    next();
  } catch (e) {
    console.log("error form here seller auth", e);
  }
};

module.exports = auth;
