const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uniqueValidator = require("mongoose-unique-validator");

const sellerSchema = new mongoose.Schema({
  sellername: {
    type: String,
  },
  selleremail: {
    type: String,
    unique: true,
  },
  sellerpassword: {
    type: String,
  },
  sellerTokenActivation: {
    type: String,
  },
  sellerisVerified: {
    type: Boolean,
    defaultValue: false,
  },
  sellerphonenumber: {
    type: String,
  },
  tokens: [
    {
      token: {
        type: String,
        // required:true
      },
    },
  ],
});

sellerSchema.methods.generateAuthtoken = async function () {
  const seller = this;

  const token = await jwt.sign(
    { _id: seller._id.toString() },
    process.env.JWT_ACC_KEY
  );
  console.log("toke generated is ", token);
  seller.tokens = seller.tokens.concat({ token });
  await seller.save();
  return token;
};

sellerSchema.statics.findByCredentials = async (
  selleremail,
  sellerpassword
) => {
  console.log("From findBy cred of seller");
  const seller = await Seller.findOne({ selleremail });
  // console.log("sele is", seller);
  if (!seller) {
    return seller;
  }
  // console.log("from find by cred 2", seller);
  const isMatch = await bcrypt.compare(sellerpassword, seller.sellerpassword);
  // console.log("is mathc of id and pass", isMatch);
  if (!isMatch) {
    console.log("Wrong Creds");
    return false;
  }

  return seller;
};

sellerSchema.pre("save", async function (next) {
  const seller = this;

  if (seller.isModified("sellerpassword")) {
    seller.sellerpassword = await bcrypt.hash(seller.sellerpassword, 8);
  }
  next();
});

sellerSchema.plugin(uniqueValidator);
const Seller = mongoose.model("Seller", sellerSchema);
module.exports = Seller;
