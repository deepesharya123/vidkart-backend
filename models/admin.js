const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uniqueValidator = require("mongoose-unique-validator");

const adminSchema = new mongoose.Schema({
  adminName: {
    type: String,
  },
  adminEmail: {
    type: String,
    unique: true,
  },
  adminPassword: {
    type: String,
  },
  amdinTokenActivation: {
    type: String,
  },
  adminIsVerified: {
    type: Boolean,
    default: true,
  },
  adminPhonenumber: {
    type: String,
  },
  tokens: [
    {
      token: {
        type: String,
      },
    },
  ],
});

adminSchema.methods.generateAuthtoken = async function () {
  const admin = this;
  const token = await jwt.sign(
    { _id: admin._id.toString() },
    process.env.JWT_ACC_KEY
  );

  admin.tokens = admin.tokens.concat({ token });
  await admin.save();
  return token;
};

adminSchema.statics.findByCredentials = async (adminEmail, adminPassword) => {
  const admin = await Admin.findOne({ adminEmail });
  if (!admin) throw new Error(adminEmail + "This email is not registered.");

  const isMatch = bcrypt.compare(adminPassword, admin.adminPassword);
  if (!isMatch) throw new Error("Please enter correct password.");

  return admin;
};

adminSchema.pre("save", async function (next) {
  const admin = this;
  // isModifies return true if the password is modified or is new
  if (admin.isModified("adminPassword")) {
    admin.adminPassword = await bcrypt.hash(admin.adminPassword, 8);
  }
  next();
});

adminSchema.plugin(uniqueValidator);
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
