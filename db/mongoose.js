const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to the DataBase on ", MONGO_URL))
  .catch((e) => console.log(e));
