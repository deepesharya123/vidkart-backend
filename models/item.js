const mongoose = require('mongoose')
const Seller  = require('../models/seller')
const itemSchema = new mongoose.Schema({
   
    title:{
        type:String,
        required:true,
        lowercase:true
    },
    college:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
        minlength:5
    },
    price:{
        type:String,
        required:true
    },
     imagePath:{
        type:String,
        // required:true,
    },
    phoneNumber:{
        type:String
    },
    owner:{
        type:String,
    }
})

itemSchema.statics.findItemByemail = async function(email){
    const items = await Item.find({owner:email})
    // console.log(items)
    if(!items){
        return 
    }
    return items
}

itemSchema.statics.generateOwner = async function(para,owner,image,number){

    const {title,description,price,college}  = para;
    const item = {
        title,
        description,
        price,
        owner,
        imagePath:image,
        phoneNumber:number,
        college,
    }

    return item
}

const Item = mongoose.model('Item',itemSchema)

module.exports = Item;