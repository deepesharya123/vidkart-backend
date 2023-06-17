const Seller = require("../models/seller");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    console.log("auth of seller : req=>", req.cookies);
    const token = req.cookies["auth_token"];
    const decoded = jwt.verify(token, process.env.JWT_ACC_KEY);
    console.log({ token, decoded });
    console.log(typeof decoded._id);

    const seller = await Seller.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    console.log("seller from auth is", seller);
    if (!seller) {
      throw new Error("NO user found");
    }

    req.token = token;
    req.seller = seller;
    // console.log(req.seller)
    // console.log(seller)
    next();
  } catch (e) {
    console.log("error form here seller auth", e);
  }
};

module.exports = auth;
