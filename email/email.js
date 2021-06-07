const sgMail = require('@sendgrid/mail');



sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

const sendEmail = (email,name,url)=>{
    sgMail.send({
        to:email,
        from:'vidkart4u@gmail.com',
        subject:'Thanks for joining',
        text:"Hello, i am from vidkart",
        
        html:`
        Hello ${name},
        For you better experience we are requesting you to please 
        verify your account by inserting the following link on verifiaction page.       
        <a><br>"${url}"</a>
        `
    },(err,res)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log("MAIL HAS BEEN SENT SUCCESSFULLY")
        }
    })
}


const resetPassEmail = (email,url)=>{
    sgMail.send({
        to:email,
        from:'vidkart4u@gmail.com',
        subject:'Reset Password',
        text:"Sure ?  Wanna change your password",
        
        html:`
        Hello ${email},
        You have requested for PASSWORD CHANGE so to change 
        your password please enter the following line to the form.
        <a><br> 
        ${url}

        
        `
    },(err,res)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log("MAIL HAS BEEN SENT SUCCESSFULLY")
        }
    })
}

module.exports = {
    sendEmail,
    resetPassEmail
};
