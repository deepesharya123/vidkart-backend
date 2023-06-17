const Sib = require("sib-api-v3-sdk");
const client = Sib.ApiClient.instance;

const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const transEmailApi = new Sib.TransactionalEmailsApi();
const sender = { email: "vidkart4u@gmail.com" };

const sendEmail = (email, name, url) => {
  const recievers = [{ email }];
  transEmailApi
    .sendTransacEmail({
      sender,
      to: recievers,
      subject: "Thanks for joining",
      textContent: `
    Hello ${name},
    For you better experience we are requesting you to please 
    verify your account by inserting the following link on verifiaction page.       
    <a><br>"${url}"</a>
    `,
    })
    .then((res) => console.log("response afer sending email", res))
    .catch((err) => console.log("Error during sending email", err));
};

const resetPassEmail = (email, url) => {
  const recievers = [{ email }];
  transEmailApi
    .sendTransacEmail({
      sender,
      to: recievers,
      subject: "Reset Password",
      textContent: `
      Hello ${email},
      You have requested for PASSWORD CHANGE so to change 
      your password please enter the following line to the form.
      <a><br> 
      ${url}

      
      `,
    })
    .then((res) => console.log("sending forget email", res))
    .catch((err) => console.log("sending forget email", err));
};

module.exports = {
  sendEmail,
  resetPassEmail,
};
