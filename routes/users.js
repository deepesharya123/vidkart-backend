const express = require("express");
const router = new express.Router();
const Seller = require("../models/seller");
const Item = require("../models/item");
const authseller = require("../middleware/authseller");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const { sendEmail, resetPassEmail } = require("../email/email");
const College = require("../models/college");

router.get("/register", async (req, res) => {
  res.render("sellerregister");
});

router.get("/login", async (req, res) => {
  console.log("asdf");
  res.render("sellerlogin");
});

router.get("/", async (req, res) => {
  res.render("sellerlogin");
});

router.post("/register", async (req, res) => {
  try {
    console.log("Came to backend for register customer, req.body", req.body);
    const seller = new Seller(req.body);
    seller.sellerisVerified = false;
    const sellername = seller.sellername;
    const selleremail = seller.selleremail;
    const sellerpassword = seller.sellerpassword;
    const property = "Seller";
    console.log("SEller 1", seller);
    const token = jwt.sign(
      { sellername, property, selleremail, sellerpassword },
      process.env.JWT_ACC_KEY
    );
    const randomNumber = Math.floor(Math.random() * 1000000);
    seller.sellerTokenActivation = token;
    console.log("SEller 2", seller);

    await seller.save();
    console.log("Seller is saved into DB", seller);
    const email = selleremail;
    const name = sellername;
    const url = token;
    console.log("Data has been saved of seller", randomNumber);

    console.log({ "req.body": req.body, seller });

    sendEmail(selleremail, sellername, url);

    // res.render("sverify");
    res.status(200).json({ message: "seller created" });
  } catch (e) {
    console.log(e);
    res.status(400).json({ e });
  }
});

router.post("/sverify", async (req, res) => {
  try {
    console.log("FROM sverify ", req.body);
    const seller = await Seller.findOne({
      sellerTokenActivation: req.body.token.sellerTokenActivation,
    });
    console.log("seller", seller);

    if (!seller) {
      res.status(401).json({ message: "Please enter correct token" });
    }
    console.log("Seller is ", seller);
    seller.sellerisVerified = true;
    console.log("Seller is ", seller);
    seller.save();
    console.log(seller);
    // res.render("sellerlogin");
    res.status(200).json({ message: "Seller verified" });
  } catch (e) {
    console.log(e);
  }
});

router.post("/login", async (req, res) => {
  console.log("req.body from login backend", req.body);
  try {
    const { selleremail, sellerpassword } = req.body;

    const seller = await Seller.findByCredentials(selleremail, sellerpassword);
    // console.log("Seller from backend during login", seller);
    if (!seller) {
      res.status(404).json({ message: "Please verify your credentials" });
      // return;
      // res.send("<center><h1>The Email id is not registered.</h1></center>");
    }
    const token = await seller.generateAuthtoken();
    console.log("token to be set", token);

    // setting cookie by backend(for backend only)
    res.cookie("auth_token", token, {
      secure: true,
      // httpOnly: true,
      maxAge: 1209600000,
    });
    // res.send("Set the cookie");
    // console.log(" auth_token saved from login seller", req.cookies);
    // console.log("req from login seller", req);
    if (seller.sellerisVerified === true) {
      res.status(200).json({
        message: "User have Logged in Successfully, you can start selling!",
        token,
      });
      // res.render("dashboard", {
      //   name: seller.sellername,
      // });
    } else {
      res.status(400).json({ message: "Please verify your account" });
      // res.end("Please Verify your account before login");
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/logout", authseller, async (req, res) => {
  console.log("req.body from logout route", req.body);
  try {
    console.log("req.body From seller logout", req.body);
    console.log({ "req.token": req.token, "req.seller": req.seller });
    req.seller.tokens = req.seller.tokens.filter(
      (token) => token.token != req.token
    );
    await req.seller.save();
    console.log("Logging out for seller");
    res.status(200).json({ message: "logged out successfully!" });
    // res.redirect("/");
  } catch (e) {
    console.log(e);
  }
});

router.post("/previousItem", authseller, async (req, res) => {
  console.log("Frm Previous items", req.body);
  try {
    const sellermail = req.seller.selleremail;
    console.log(sellermail);

    const items = await Item.findItemByemail(sellermail);
    // items is a array of objects.
    console.log("i am here");
    // console.log(items);

    const itemLength = items.length;
    console.log(itemLength);
    res.status(200).send(items);
    // res.render("sshowitem", {
    //   name: req.seller.sellername,
    //   items: items,
    //   itemLength,
    // });
  } catch (e) {
    console.log("Seom error occured while fetching  previous items", e);
  }
});

router.get("/uploadItem", async (req, res) => {
  console.log("1");

  res.render("additem");
  console.log("I am here");
});

router.post("/addnewItem", async (req, res) => {
  console.log("2");

  // res.send("GOOD")
  res.render("additem");
});

const storage = multer.diskStorage({
  destination: "./public/upload",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log("file from upload", file);
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb("Please check the content type");
    }
    cb(undefined, true);
  },
}).single("ProductUpload", 10);

router.post("/uploadItem", authseller, async (req, res) => {
  try {
    upload(req, res, async (err) => {
      const owner = req.seller.selleremail;
      const phonenumber = req.seller.sellerphonenumber;
      const collegeOfItem = req.body.college;

      const url = req.body.ProductUpload;
      console.log("req.body fromupload item ", req.body);
      console.log("req.file", req.file);
      // req.file.filename,
      let item = await Item.generateOwner(
        req.body,
        owner,
        url,
        // req.body.file.filename,
        phonenumber
      );
      const CollegeExists = await College.find({});
      // console.log("CollegeExists", CollegeExists);

      let present = false;
      const useCollege = {};
      CollegeExists.forEach((college) => {
        if (college.collegeName === collegeOfItem) {
          present = true;
          useCollege.collegeName = college.collegeName;
          useCollege.collegeCount = college.collegeCount;
        }
      });
      if (!present) {
        const CollegeForSave = {};
        CollegeForSave.collegeName = collegeOfItem;
        CollegeForSave.collegeCount = 1;
        const saveCollege = new College(CollegeForSave);
        await saveCollege.save();
      } else
        await College.updateOne(
          { collegeName: collegeOfItem },
          { collegeCount: useCollege.collegeCount + 1 }
        );

      const CollegeInfo = await College.find({});

      const itemforSave = new Item(item);
      await itemforSave.save();
      console.log("Item is Saved Enjoy!,, yout item is", itemforSave);
      // res.redirect('/uploadItem')
      // res.render("additem");
      res.status(200).json({ message: "Item succesfully uploaded!" });
    });
  } catch (e) {
    res
      .status(406)
      .json({ message: "Item was not uploaded! Please try again." });

    console.log(e);
  }
});

router.post("/deletethisItem/", authseller, async (req, res) => {
  console.log("req.body from delete route", req.body);

  // step1: i have load all the items
  // AND THEN increment the counter
  // if found the item havind owner with that seller
  // and then i can fewtch its id
  // and then delete that id

  try {
    // const selleremail = req.seller.selleremail;
    // console.log(selleremail);
    // // const items = await Item.findAllItemByEmail(selleremail);
    // const item = await Item.find();
    // console.log("item.length" + item.length);
    // let count = -1;
    // const reqId = req.params.id;
    // console.log(reqId);
    // let information = [];
    // for (i = 0; i < item.length; i++) {
    //   const reqitem = item[i];
    //   if (reqitem.owner === selleremail) {
    //     information.push(reqitem);
    //   }
    // }
    // console.log("information");
    // console.log(information);
    // console.log("good");
    // const reqitemforDeletion = information[req.params.id];
    const reqitemforDeletion = req.body.id;
    console.log(reqitemforDeletion);
    const items = await Item.findByIdAndRemove(reqitemforDeletion);
    // console.log(item)
    const renderItem = await Item.find({ owner: req.seller.selleremail });
    console.log(renderItem);
    res.status(200).json({ message: "Item Delete Successfully" });
    // res.render("sshowitem", {
    //   name: req.seller.sellername,
    //   items: renderItem,
    //   itemLength: renderItem.length,
    // });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
