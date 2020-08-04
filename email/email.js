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
        <a>${url}</a>
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


module.exports = sendEmail;
