const Seller = require('../models/seller');
const jwt = require('jsonwebtoken');

const auth =async (req,res,next)=>{
    try{
        const token = req.cookies['auth_token'];
        const decoded = jwt.verify(token,"THEsecretKEY!@#")
        // console.log(decoded)
        // console.log(typeof(decoded._id))

        const seller = await Seller.findOne({_id:decoded._id,'tokens.token':token})

        if(!seller){
            throw new Error("NO user found")
        }

        req.token = token;
        req.seller = seller;
        // console.log(req.seller)
        // console.log(seller)
        next()

    }
    catch(e){
        console.log(e);
    }

}

module.exports = auth;
