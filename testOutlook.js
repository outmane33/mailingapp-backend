const nodemailer = require("nodemailer");

async function sendEmail() {
  // Create a transporter object using SMTP transport for Outlook
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // Outlook SMTP server
    port: 587, // Port for TLS
    secure: false, // Use TLS
    auth: {
      user: "marshalls.marshalls90030.937@coycoy.gb.net", // Your Outlook email address
      pass: "S317M1zZnWe", // Your Outlook email password
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  // Define email options
  let mailOptions = {
    from: `diezsnef <marshalls.marshalls90030.937@coycoy.gb.net>`, // Sender address
    to: "wgb97@elp.rr.com", // Recipient address
    subject: "jezoije zeci", // Subject line
    text: "zeuide zeiuiez iezoedz", // Plain text body
  };

  try {
    // Send email
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error occurred while sending email:", error.message);
  }
}

// Call the function to send email
sendEmail();
