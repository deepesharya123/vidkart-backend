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
    
    // var signThis= customer._id.toString();
    // if(customer.forgetPassword){
    //     var ren = Math.random();
    //     console.log(signThis+" msignthis before change");
    //     signThis = signThis.substring(0,signThis.length-ren.length);
    //     ren = ren.toString();
    //     ren = ren.substring(ren.indexOf('.'+1));
    //     signThis+=ren;
        
    //     console.log(signThis+" msignthis before change");
    //     console.log(ren+" this is the ren");
    //     // console.log(signThis)
    // }
    var v1 = Math.random();
    var v2 = Math.random();
    console.log(v1+" v1");
    console.log(v2+ "v2");
    var signThis = v1+v2;
    signThis=signThis.toString();
    console.log(signThis)
    const token = await jwt.sign({signThis},process.env.FORGOT_PASS,{expiresIn:'300s'})
    console.log(customer)
    customer.forgetPassword = token;
    console.log(customer)
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
        return ;
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
