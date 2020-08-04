const jwt = require('jsonwebtoken');
const Customer = require('../models/customer');

const customerAuth = async function(req,res,next){
    try{
        
        const token = req.cookies['auth_token'];
        const decoded = jwt.verify(token,"THEsecretKEY!@#")
        const customer = await Customer.findOne({_id:decoded._id,'tokens.token':token})
        
        if(!customer){
            console.log("NO authorization for this customer")
        }

        console.log("I am here in the cusotmer auth")
        req.customer = customer;
        // console.log(req.customer)
        req.token = token;
        console.log()
            next();
    }catch(e){
        console.log(e)
    }
}

module.exports = customerAuth;