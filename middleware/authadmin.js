const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");

const adminAuth = async (req, res, next) => {
  console.log("auth admin ", req.body);
  try {
    // const token = req.cookies["auth_token"];
    const token = req.body.token;
    console.log("token from admin auth", {
      token,
    });
    const decoded = jwt.verify(token, process.env.JWT_ACC_KEY);

    const admin = await Admin.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!admin) throw new Error("No Admin Found");

    req.token = token;
    req.admin = admin;
    console.log("admin form auth", req.admin);
    next();
  } catch (e) {
    console.log(e);
  }
};

module.exports = adminAuth;
