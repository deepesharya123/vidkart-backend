const mongoose = require('mongoose')
const Seller  = require('../models/seller')
const itemSchema = new mongoose.Schema({
   
    title:{
        type:String,
        required:true,
        lowercase:true
    },description:{
        type:String,
        required:true,
        minlength:50
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
    // console.log(para)

    const {title,description,price}  = para
    const item = {title,
        description,
        price,
        owner:owner,
        imagePath:image,
        phoneNumber:number,
    }

    // console.log(item)

    return item

}




const Item = mongoose.model('Item',itemSchema)

module.exports = Item;