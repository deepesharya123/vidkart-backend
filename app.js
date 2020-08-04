const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const cookieParser =require('cookie-parser')

require('dotenv').config('./dev.env');

const port = process.env.PORT;

const viewsPath = path.join(__dirname,'./views');
const publicDir = path.join(__dirname,'./public');

app.use(express.json());
app.use(express.static(publicDir));
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');
app.set('views',viewsPath)
app.use(cookieParser())
require('./db/mongoose')
app.get('/',async(req,res)=>{
    const itemlen = 0;
    res.render("index",{
        itemlen
    });
})

app.use('/users/',require('./routes/users'));

app.use('/customer/',require('./routes/customer'))




app.listen(port,()=> console.log("CONNECTED TO THE SERVER ON "+port))