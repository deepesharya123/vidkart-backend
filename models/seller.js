const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

const sellerSchema = new mongoose.Schema({
    sellername:{
        type:String,
    },
    selleremail:{
        type:String,
        unique:true
    },
    sellerpassword:{
        type:String
    },
    sellerTokenActivation:{
        type:String
    },
    sellerisVerified:{
        type:Boolean,
        defaultValue:false
    },
    sellerphonenumber:{
        type:String,
        minlength:10,
        maxlength:10,
    },
    tokens:[{
        token:{
            type:String,
            // required:true
        }
    }]

})

sellerSchema.methods.generateAuthtoken = async function(){
    const seller = this;

    const token = await jwt.sign({_id:seller._id.toString()},process.env.JWT_ACC_KEY)

    seller.tokens = seller.tokens.concat({token})
    await seller.save();
    return token; 


}


sellerSchema.statics.findByCredentials = async(selleremail,sellerpassword)=>{

    const seller = await Seller.findOne({selleremail}) 
    if(!seller){
        return seller;
    }

    const isMatch = await bcrypt.compare(sellerpassword,seller.sellerpassword)

    if(!isMatch){
        console.log("Wrong Creds"); 
        return "sd";
    }

    return seller;
}



sellerSchema.pre('save',async function(next){
    const seller = this;
    
    if(seller.isModified('sellerpassword')){
        seller.sellerpassword = await bcrypt.hash(seller.sellerpassword,8)

    }
next();
})


sellerSchema.plugin(uniqueValidator);
const Seller = mongoose.model('Seller',sellerSchema);
module.exports = Seller