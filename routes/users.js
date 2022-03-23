const express = require('express');
const router = new express.Router();
const Seller = require('../models/seller');
const Item = require('../models/item');
const authseller  = require('../middleware/authseller');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken')
const {sendEmail,resetPassEmail} = require('../email/email')
const College = require('../models/college');

router.get('/register',async(req,res)=>{
    res.render("sellerregister");
})

router.get('/login',async(req,res)=>{
    res.render('sellerlogin')
})

router.get('/',async(req,res)=>{
    res.render('sellerlogin')
})

router.post('/register',async(req,res)=>{
    try{
        
        const seller = new Seller(req.body);
        seller.sellerisVerified  =false
        const sellername= seller.sellername;
        const selleremail = seller.selleremail;
        const sellerpassword = seller.sellerpassword;
        const property = "Seller"
        const token = jwt.sign({sellername,property,selleremail,sellerpassword},process.env.JWT_ACC_KEY)
        seller.sellerTokenActivation = token;
      

        console.log(seller)
        await seller.save()
        const email =selleremail;
        const name = sellername;
        const url = token
        console.log("Data has been saved of seller")

        console.log(req.body)

        sendEmail(selleremail,sellername,url)
        
        res.render('sverify')

    }catch(e){
        res.send("<center><h1>There is some problem with registering this seller. </h1></center>")
        console.log(e)
    }


})

router.post('/sverify',async(req,res)=>{
    try{
        // {
        //     sverifyToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWxsZXJuYW1lIjoiRGVlcCIsInNlbGxlcmVtYWlsIjoiZGVlcGVzaGFyeWE4MjI0NkBnbWFpbC5jb20iLCJzZWxsZXJwYXNzd29yZCI6ImRlZXBlc2hhcnlhODIyNDZAZ21haWwuY29tIiwiaWF0IjoxNTk2MzY0NjAwfQ.YDIAeRxMOSaBhqjLMo8ugzkP72rVUF7XbF5J8Il97io'
        //   }

        const stoken = req.body. sverifyToken;
    console.log(stoken)
        const seller = await Seller.findOne({sellerTokenActivation: stoken})
    
        if(!seller){
            res.send("You are not Authorized to perform this action")
        }
    
        seller.sellerisVerified= true;
        seller.save()
        console.log(seller)
        res.render('sellerlogin')
    
    
        }catch(e){
        console.log(e)    
        }


})

router.post('/login',async(req,res)=>{
    console.log("req.body")
    try{
        const {selleremail,sellerpassword }= req.body
        
        const seller = await Seller.findByCredentials(selleremail,sellerpassword)

        if(!seller){
            res.send("<center><h1>The Email id is not registered.</h1></center>")
        }
        const token = await seller.generateAuthtoken();
        // console.log(token)
        res.cookie('auth_token',token)

        if(seller.sellerisVerified===true){
        res.render('dashboard',{
            name:seller.sellername
        })
    }
    else{
        res.end("Please Verify your account before login")
    }


    }catch(e){
        console.log(e)
    }


})


router.post('/logout',authseller,async(req,res)=>{
    try{

        req.seller.tokens = req.seller.tokens.filter((token)=> token.token!= req.token) 
        await req.seller.save()

        res.redirect('/')
        
        

    }catch(e){
        console.log(e)
    }
})

router.post('/previousItem',authseller,async(req,res)=>{
    const sellermail = req.seller.selleremail
    console.log(sellermail)

    const items = await Item.findItemByemail(sellermail)
    // items is a array of objects.
    console.log("i am here")
    console.log(items)

    const itemLength = items.length;
    console.log(itemLength)
    res.render('sshowitem',{
        name:req.seller.sellername,
        items:items,
        itemLength
    })

})


router.get('/uploadItem',async(req,res)=>{
    res.render('additem')
    console.log("I am here")
})


router.post('/addnewItem',async(req,res)=>{
    // res.send("GOOD")
    res.render('additem')
})

const storage = multer.diskStorage({
    destination:'./public/upload',
    filename:function(req,file,cb ){
        cb(null,file.fieldname+"-"+Date.now()+path.extname(file.originalname))        
    }
})

const upload = multer({
    storage:storage,
    fileFilter:function(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
            return cb("Please check the content type");
        }
        cb(undefined,true)
    }
}).single('ProductUpload',10)


router.post('/uploadItem',authseller,async(req,res)=>{
    //  title: 'asdf', description: 'asdfasdfasdf', price: '135468
    try{
        upload(req,res,async(err)=>{

            // console.log("req.body for uploaditem",req.body)
            // console.log("req.seller for uploaditem",req.seller)
            
            const owner = req.seller.selleremail;
            const phonenumber = req.seller.sellerphonenumber;
            const collegeOfItem = req.body.college;
            console.log("College name",req.body.college)
            let item = await Item.generateOwner(req.body,owner,req.file.filename,phonenumber);
            const CollegeExists = await College.find({});
            console.log("CollegeExists",CollegeExists)
            
            let present = false;
            const useCollege = {};
            CollegeExists.forEach((college)=>{
                if(college.collegeName===collegeOfItem){
                    present=true;
                    useCollege.collegeName=college.collegeName;
                    useCollege.collegeCount=college.collegeCount;
                }
            })
            if(!present){
                const CollegeForSave = {};
                CollegeForSave.collegeName = collegeOfItem;
                CollegeForSave.collegeCount = 1;
                const saveCollege = new College(CollegeForSave);
                await saveCollege.save();
            }
            else
                await College.updateOne({collegeName:collegeOfItem},{collegeCount:useCollege.collegeCount+1})
            
            const CollegeInfo =await College.find({});

            const itemforSave = new Item(item);
            await itemforSave.save()

            // res.redirect('/uploadItem')
            res.render('additem')
        })

    }catch(e){
        console.log(e)
    }
})

router.post('/deletethisItem/:id',authseller,async(req,res)=>{
    console.log(req.params)

    // step1: i have load all the items 
    // AND THEN increment the counter 
    // if found the item havind owner with that seller  
    // and then i can fewtch its id 
    // and then delete that id

    try{
        const selleremail = req.seller.selleremail;
        console.log(selleremail)
        // const items = await Item.findAllItemByEmail(selleremail);
        const item = await Item.find()
        console.log("item.length"+item.length)
        let count = -1;
        const reqId = req.params.id;
        console.log(reqId)

        let information = [];

        for(i=0;i<item.length;i++){
            const reqitem = item[i];
            if(reqitem.owner === selleremail){
                information.push(reqitem)
            }
        }
        console.log("information")
            console.log(information)
        console.log("good")

        const reqitemforDeletion = information[req.params.id];
        console.log(reqitemforDeletion)

        const items = await Item.findByIdAndRemove(reqitemforDeletion._id)

        // console.log(item)
     const renderItem = await Item.find({owner:req.seller.selleremail})

     console.log(renderItem)
        res.render("sshowitem",{
            name:req.seller.sellername,
            items:renderItem,
            itemLength:renderItem.length,
        })
        


    }catch(e){
        console.log(e)
    }


})


module.exports =  router;
