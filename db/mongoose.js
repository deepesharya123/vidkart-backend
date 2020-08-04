const mongoose = require('mongoose');
// mongodb://127.0.0.1:27017/task-manager-api

mongoose.connect(process.env.MONGO_URL, { useUnifiedTopology: true,useNewUrlParser:true ,useCreateIndex: true} )
.then(()=> console.log("Connected to the DastaBase"))
.catch((e)=> console.log(e))


