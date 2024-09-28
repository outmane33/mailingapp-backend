const transporter = require("nodemailer").createTransport({
  host: "smtp.t-online.de",
  port: 25, // Port 25 for unencrypted SMTP traffic
  secure: false, // Set secure to false for port 25
  auth: {
    user: "huber.98@t-online.de",
    pass: "fabian98",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Send a test email
transporter.sendMail(
  {
    from: "huber.98@t-online.de",
    to: "wgb97@elp.rr.com",
    subject: "Testing Port 25 Connection",
    text: "This is a test email sent over port 25.",
  },
  (error, info) => {
    if (error) {
      return console.log("Error:", error.message);
    }
    console.log("Email sent successfully:", info.response);
  }
);
