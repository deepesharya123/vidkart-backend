const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    id:{
        type:String     // this is the id of the item from items model
    },
    cartOwner:{
        type:String     // this is the email id of the customer model
    }
})

const Cart = mongoose.model('Cart',cartSchema);

module.exports = Cart;