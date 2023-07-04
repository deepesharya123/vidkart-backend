const express = require("express");
const router = new express.Router();
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const { sendEmail, resetPassEmail } = require("../email/email");
const adminAuth = require("../middleware/authadmin");
const Item = require("../models/item");
const College = require("../models/college");

router.get("/register", async (req, res) => {
  res.render("adminRegister");
});

router.get("/login", async (req, res) => {
  res.render("adminlogin");
});

router.post("/register", async (req, res) => {
  try {
    console.log("req.body ", req.body);
    const admin = new Admin(req.body);
    console.log("admin 1", admin);
    admin.adminIsVerified = false;
    const { adminEmail, adminName, adminPassword } = admin;
    const property = "Admin";
    const token = jwt.sign(
      { adminEmail, property, adminPassword, adminName },
      process.env.JWT_ACC_KEY
    );
    // const num = Math.random().toString();
    // let run = num.length-2;
    // let activationurl = '';
    // while(num.length-run<8){
    //     run--;
    //     activationurl+=token[num[run]];
    // }
    // activationurl=adminEmail+"&^email@&"+activationurl;
    // admin.amdinTokenActivation = activationurl;
    admin.amdinTokenActivation = token;
    console.log("admin ", admin);
    // console.log("activationurl ",activationurl);
    await admin.save();
    sendEmail(adminEmail, adminName, token);
    res.render("adminverify", { adminEmail });
  } catch (e) {
    console.log(e);
    res.send(
      "<center><h1>Something went wrong during your registration.</h1></center>"
    );
  }
});

router.post("/verify", async (req, res) => {
  try {
    console.log("req.body from /verify", req.body);
    const { adminVerifyToken: adminToken } = req.body;
    const admin = await Admin.findOne({ amdinTokenActivation: adminToken });

    if (!admin) {
      res.send("No admin found");
    }
    console.log(admin);
    admin.adminIsVerified = true;
    console.log(admin);
    await admin.save();
    res.render("adminlogin");
  } catch (e) {
    console.log(e);
    res.send("<h1><center>Something went wrong</center></h1>");
  }
});

router.post("/product", async (req, res) => {
  try {
    const search = req.body.search;
    const items = await Item.find({ title: search });
    res.render("index", {
      itemlen: items,
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("req.body from admin login", req.body);
    const { adminEmail, adminPassword } = req.body;
    const admin = await Admin.findByCredentials(adminEmail, adminPassword);
    console.log("admin from login of admin", amdin);
    if (!admin || admin instanceof Error) {
      res.status(404).json({ message: "Please verify your credentials" });

      // res.render(admin);
    }

    const token = await admin.generateAuthtoken();
    // res.cookie("auth_token", token);
    const { adminName } = admin;
    const items = await Item.find({});
    const AllCollege = await College.find({});
    const Colleges = [];
    AllCollege.forEach((college) => {
      if (Colleges.indexOf(college.collegeName) === -1)
        Colleges.push(college.collegeName);
    });

    res.status(200).json({
      message: "Admin have Logged in Successfully, you can have a eye!",
      token,
    });
    // console.log('items are', items);
    // console.log('Colleges are', Colleges);
    // res.render('admindashboard', {
    //     name: adminName,
    //     itemlen: 0,
    //     items,
    //     Colleges,
    // });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "Please verify your account" });

    // res.send("<h1><center>Something went wrong.</center></h1>");
  }
});

router.post("/logout", adminAuth, async (req, res) => {
  try {
    console.log("req.body from logout", req.body);
    const token = req.token;
    req.admin.tokens = req.admin.tokens.filter(
      (token) => token.token != req.token
    );
    req.admin.save();
    res.redirect("/");
  } catch (e) {
    console.log(e);
  }
});

router.post("/deletethisItem", adminAuth, async (req, res) => {
  console.log("delethe this ite ", req.body);
  try {
    await Item.findByIdAndRemove(req.body.id);

    res.status(202).json({ message: "Item is deleted successfully" });
  } catch (e) {
    console.log("Some error occured during remove item", e);
  }
});

router.post("/allitems", adminAuth, async (req, res) => {
  try {
    const allItems = await Item.find({});
    console.log("All items from all item admin", allItems);
    res.status(200).send(allItems);
  } catch (e) {
    console.log("something wrong occured during getching all items", err);
  }
});

module.exports = router;
