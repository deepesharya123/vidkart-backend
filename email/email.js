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
      htmlContent: `
      <p>Hello ${name},</p>
      <p>For a better experience, please verify your account by pasting the below token.</p>
      <p><a href="${url}" target="_blank">${url}</a></p>
      
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
