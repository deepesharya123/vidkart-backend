const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config("./dev.env");
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());

const port = process.env.PORT;

const viewsPath = path.join(__dirname, "./views");
const publicDir = path.join(__dirname, "./public");

app.use(express.json());
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", viewsPath);

require("./db/mongoose");
app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.get("/demo", (req, res) => {
  res.json({ name: "deepesh ", tech: "mern" });
});

app.get("/", async (req, res) => {
  const itemlen = 0;
  res.render("index", {
    itemlen,
  });
});

// seller == users in backend
app.use("/users/", require("./routes/users"));
app.use("/customer/", require("./routes/customer"));
app.use("/admin/", require("./routes/admin"));

app.listen(port, () => console.log("CONNECTED TO THE SERVER ON " + port));
