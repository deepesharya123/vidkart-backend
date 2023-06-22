const express = require("express");
const router = new express.Router();
const Item = require("../models/item");
const Customer = require("../models/customer");
const customerAuth = require("../middleware/customerauth");
const Cart = require("../models/cartowner");
const jwt = require("jsonwebtoken");
// const nodemailer = require('nodemailer')
const mailGun = require("nodemailer-mailgun-transport");
const { sendEmail, resetPassEmail } = require("../email/email");

// const mailgun = require("mailgun-js");

const nodemailer = require("nodemailer");
router.get("/register", async (req, res) => {
  res.render("cregister");
});

router.get("/login", async (req, res) => {
  res.render("clogin");
});

router.get("/product/:search", async (req, res) => {
  try {
    // const search = req.body.search;
    const { search } = req.params;
    const items = await Item.find({ title: search });
    // console.log("searched item is ", search);
    // console.log("items", items);
    res.send({ items });
  } catch (e) {
    console.log(e);
  }
});

router.get("/checked", async (req, res) => {
  try {
    res.send("GOOD");
  } catch (e) {
    console.log(e);
  }
});

router.get("/loginafter", async (req, res) => {});
router.post("/register", async (req, res) => {
  try {
    const customer = new Customer(req.body);
    customer.customerisVerified = false;
    const customername = customer.customername;
    const customeremail = customer.customeremail;
    const customerpassword = customer.customerpassword;
    const property = "Customer";
    const token = jwt.sign(
      { customername, property, customeremail, customerpassword },
      process.env.JWT_ACC_KEY
    );
    customer.customerTokenActivation = token;
    // console.log(customer)
    await customer.save();
    // console.log(token)

    const url = token;

    const name = customername;
    const email = customeremail;
    sendEmail(email, name, url);

    res.status(200).json({ message: "Registered Successfully!" });
    // res.render("cverify");
  } catch (e) {
    console.log(e);
    res.status(409).json({ message: "User is already registered!" });
  }
});

router.post("/cverify", async (req, res) => {
  // {
  //     cverifyToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcm5hbWUiOiJEZWVwZXNoIEFyeWEiLCJjdXN0b21lcmVtYWlsIjoiZGVlcGVzaGFyeWE4MjI0NkBnbWFpbC5jb20iLCJjdXN0b21lcnBhc3N3b3JkIjoiZGVlcGVzaGFyeWE4MjI0NkBnbWFpbC5jb20iLCJpYXQiOjE1OTYzNTY5MjMsImV4cCI6MTU5NjM1ODEyM30.pueUdloNaXgyNGkClLvAowYrhntFlBWNGAZqfYSStM0'
  //   }
  try {
    console.log("From Cverify boduy", req.body);
    const ctoken = req.body.cverifyToken;
    const customer = await Customer.findOne({
      customerTokenActivation: req.body.token.customerTokenActivation,
    });
    console.log("customer ", customer);
    if (!customer) {
      res.status(401).json({ message: "Please enter correct token" });

      // res.send("You are not Authorized to perform this action");
    }
    customer.customerisVerified = true;
    await customer.save();
    console.log(customer);
    res.render("clogin");
  } catch (e) {
    console.log(e);
    res.send("<h1><center>Something went wrong</center></h1>");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { customeremail, customerpassword } = req.body;
    const customer = await Customer.findByCredentials(
      customeremail,
      customerpassword
    );
    if (!customer) {
      res.status(404).json({ message: "Please verify your credentials" });

      // res.send(
      //   "You are not registered, Please make sure that you are registered."
      // );
    }

    const token = await customer.generateAuthtoken();
    console.log("token to be set from customer", token);
    // setting cookie by backend(for backend only)
    res.cookie("auth_token", token, {
      secure: true,
      // httpOnly: true,
      maxAge: 1209600000,
    });
    const name = customer.customername;
    // console.log(customer)

    const itemlen = 0;
    console.log("item", { len: itemlen, verifi: customer.customerisVerified });
    if (customer.customerisVerified === true) {
      res.status(200).json({
        message:
          "User have Logged in Successfully, search your product and buy them!",
        token,
      });
      // res.render("cdashboard", {
      //   name,
      //   itemlen,
      // });
    } else {
      res.status(400).json({ message: "Please verify your account" });
      // res.send(
      //   "<center><h1>Please verify your email before login</h1></center>"
      // );
    }
  } catch (e) {
    console.log("Login error ", e);
  }
});

router.post("/logout", customerAuth, async (req, res) => {
  try {
    const token = req.token;
    // console.log(token);

    req.customer.tokens = req.customer.tokens.filter(
      (token) => token.token != req.token
    );

    req.customer.save();

    res.redirect("/");
  } catch (e) {
    console.log(e);
  }
});

router.get("/login", async (req, res) => {
  res.render("clogin");
});

router.post("/addtocart", async (req, res) => {
  try {
    // res.send(req.customer)
    console.log(" 3");
    // console.log(req.customer)=== null){
    res.redirect("/customer/login");
  } catch (e) {
    console.log(e);
  }
});

router.post("/loggedin/product", customerAuth, async (req, res) => {
  try {
    const search = req.body.search;
    const name = req.customer.customername;
    const items = await Item.find({ title: search });
    res.render("cdashboard", {
      name,
      itemlen: items,
    });
  } catch (e) {
    console.log(e);
  }
});

// router.post("/loggedin/addtocart/:id", customerAuth, async (req, res) => {
router.post("/loggedin/addtocart/", customerAuth, async (req, res) => {
  console.log("loggediin addot cart ", req.body);
  try {
    const reqItemId = req.body.id;
    console.log(reqItemId);

    const item = await Item.findById(reqItemId);
    console.log(item);

    const id = reqItemId; // THIS IS  THE ACTUALL ID OF THE ITEM
    const cartOwner = req.customer.customeremail;

    const cartReady = { id, cartOwner };
    console.log(cartReady);
    const checkcartItem = await Cart.find({
      id: reqItemId,
      cartOwner: req.customer.customeremail,
    });

    if (checkcartItem.length === 0) {
      const cartPart = new Cart(cartReady);
      await cartPart.save();

      console.log(cartReady);
      console.log(":cartPart.save()Line 178");
    } else {
      res.status(409).json({ message: "Item is already in your cart." });
      // res.send("<center><h1>Item is already in your cart</h1></center>");
    }
  } catch (e) {
    console.log(e);
  }
});

router.post("/previousItem", customerAuth, async (req, res) => {
  console.log("Frm previosuitem route", req.body);
  try {
    const items = await Cart.find({ cartOwner: req.customer.customeremail });
    console.log(items);

    const itemlen = items.length;
    console.log("itemlen", itemlen);

    const realitem = [];

    for (i = 0; i < itemlen; i++) {
      const id = items[i].id;
      console.log("asfd", id);

      const myitem = await Item.findById(id);
      if (myitem) realitem.push(myitem);
    }

    if (realitem.length === 0) {
      res.send("<center><h1>You have not added any item yet.</h1></center>");
    }

    if (realitem.length > 0) {
      const name = req.customer.customername;
      console.log("realitem 212", realitem);
      res.status(200).send(realitem);
      // res.render("ccartitem", {
      //   name,
      //   itemLength: realitem.length,
      //   items: realitem,
      // });
    }
  } catch (e) {
    console.log(e);
  }
});

// router.post("/deletethisItem/:id", customerAuth, async (req, res) => {
router.post("/deletethisItem/", customerAuth, async (req, res) => {
  try {
    console.log("Cart item deletion start");
    // console.log(req.params.id)       // this is the id of item from items model
    const delitemid = req.body.id;

    const itemfordeletion = await Cart.find({
      id: delitemid,
      cartOwner: req.customer.customeremail,
    });
    // console.log(itemfordeletion);
    const idofitemfordeletion = itemfordeletion[0]._id;
    console.log(idofitemfordeletion);
    const itemdeleted = await Cart.findByIdAndRemove(idofitemfordeletion);

    const items = await Cart.find({ cartOwner: req.customer.customeremail });

    if (items.length === 0) {
      res.status(200).json({ message: "No more items to show!" });
      // res.send("<center><h1>There is no more item</h1></center>");
    }

    if (items.length > 0) {
      const name = req.customer.customername;
      // console.log("BEFORE ITEMS");

      const itemslen = items.length;
      const displayItem = [];

      for (i = 0; i < itemslen; i++) {
        const id = items[i].id;
        const theitem = await Item.findById(id);
        console.log(theitem);
        displayItem.push(theitem);
      }
      // console.log("THE DISPLAYITM");
      // console.log(displayItem);
      res.status(200).json({ message: "Item deleted Successfully!" });
      // res.render("ccartitem", {
      //   name,
      //   itemLength: displayItem.length,
      //   items: displayItem,
      // });
    }
  } catch (e) {
    res
      .status(500)
      .json({
        message: "Some error occured while deleteing the item from cart.",
      });
    console.log(e);
  }
});

router.get("/forgotpassword", async (req, res) => {
  res.render("cchangepass");
});

router.post("/resetPassword", async (req, res) => {
  try {
    const email = req.body.customeremail;
    const url = "Checking this under the url";
    const customer = await Customer.findOne({ customeremail: email });
    if (!customer) res.send("No customer exist");
    // console.log(customer)

    const token = await customer.tokenForResetPassword(customer);
    console.log(token);

    resetPassEmail(email, token);
    res.render("codeinputforPassChange");
  } catch (e) {
    console.log(e);
  }
});

router.post("/resetPasswordPage/", async (req, res) => {
  try {
    const { tok, emailforchangingPass, newPass } = req.body;

    const customer = await Customer.findOne({
      forgetPassword: tok,
      customeremail: emailforchangingPass,
    });

    if (!customer)
      throw new Error("Please enter the correct code/User not found");

    // console.log(newPass)

    // console.log("resetPasswordPage")
    customer.customerpassword = newPass;
    await customer.save();
    res.render("clogin");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
