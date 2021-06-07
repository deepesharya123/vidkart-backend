const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uniqueValidator = require('mongoose-unique-validator');

const customerSchema = new mongoose.Schema({
    customername:{
        type:String,
    },
    customeremail:{
        type:String,
        unique:true
    },
    customerpassword:{
        type:String
    },
    customerTokenActivation:{
        type:String
    },
    customerisVerified:{
        type:Boolean,
        defaultValue:false
    },
    customerphonenumber:{
        type:String
    },
    confirm:{
        defaultValue:false
    },
    forgetPassword:{
        type:String,
        default:""
    },
    tokens:[{
        token:{
            type:String,
            // required:true
        }
    }]

})

customerSchema.methods.generateAuthtoken = async function(){
    const customer = this;

    const token = await jwt.sign({_id:customer._id.toString()},process.env.JWT_ACC_KEY)

    customer.tokens = customer.tokens.concat({token})
    await customer.save();
    return token; 

}


customerSchema.methods.tokenForResetPassword = async function(customer){
    
    var signThis= customer._id.toString();
    if(customer.forgetPassword){
        var ren = Math.random();
        console.log(signThis)
        signThis = signThis.substring(0,signThis.length-ren.length);
        ren*=10;
        signThis+=ren;
        console.log(ren);
        console.log(signThis)
    }
    const token = await jwt.sign({signThis},process.env.FORGOT_PASS,{expiresIn:'30s'})
    customer.forgetPassword = token;
    await customer.save();
    return token; 

}

customerSchema.statics.findByCredentials = async(customeremail,customerpassword)=>{

    const customer = await Customer.findOne({customeremail}) 
    console.log("GOOD1")
    
    if(!customer){
        return customer;
    }
    const isMatch = await bcrypt.compare(customerpassword,customer.customerpassword)

    if(!isMatch){
        console.log("Wrong Creds"); 
        return "sd";
    }

    return customer;
}



customerSchema.pre('save',async function(next){
    const customer = this;
    
    if(customer.isModified('customerpassword')){
        customer.customerpassword = await bcrypt.hash(customer.customerpassword,8)

    }
next();
})


customerSchema.plugin(uniqueValidator);
const Customer = mongoose.model('Customer',customerSchema);

module.exports = Customer