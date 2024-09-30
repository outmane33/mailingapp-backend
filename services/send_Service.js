const expressAsyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const { random, replaceRandomInObject } = require("../utils/randoms");
const { replacePlaceholders } = require("../utils/replacePlaceholders");
const Recipiente_Charter = require("../models/recipiente_Charter_Model");
const Recipiente_RR = require("../models/recipiente_RR_Model");
const SenderGmail = require("../models/sender_Gmail_Model");
const Drop = require("../models/drop_Model");
const ApiError = require("../utils/apiError");
const Test = require("../models/testModel");

//SEND DROP
const sendDrop = expressAsyncHandler(async function (req, res, next) {
  try {
    let {
      login, //use before send
      placeholders,
      country, //filter data
      email_type, //filter data
      count, //filter data
      duplicate, //filter data
      campaignName, // name of drop
      isp, //filter data
      startFrom, //filter data
      service,
      testEmail, // the email to send test messages
      afterTest, // send test message after this number of emails
      ...emailData
    } = req.body;

    // Replace placeholders and random values in the email data
    replacePlaceholders(emailData, placeholders);
    replaceRandomInObject(emailData);

    // Dynamically select the model based on the `isp` value in req.body
    const models = [Recipiente_Charter, Recipiente_RR, SenderGmail];
    const selectedModel = models.find((model) => model.modelName.includes(isp));

    if (!selectedModel) {
      return next(new ApiError(`No model found for ISP: ${isp}`, 400));
    }

    // Build query object to filter by country and email_type
    const query = {};
    if (country) query.country = country;
    if (email_type && email_type.length > 0)
      query.email_type = { $in: email_type };

    // Fetch or create the drop record for this campaign
    let drop = await Drop.findOne({ campaignName }).exec();
    if (!drop) {
      drop = new Drop({
        campaignName,
        lastStartIndex: startFrom,
        lastLoginIndex: 0,
        status: "active",
        login,
        placeholders,
        country,
        email_type,
        count,
        duplicate,
        startFrom,
        isp,
        total: count,
        service,
        testEmail, // saving testEmail
        afterTest, // saving afterTest
        ...emailData,
      });
      await drop.save();
    } else {
      // Update the count based on the drop progress
      count = drop.total - drop.lastStartIndex;
      drop.count = count;
      await drop.save();
    }

    let { lastStartIndex, lastLoginIndex } = drop;
    const startIndex = lastStartIndex;

    // Use the `limit` and `skip` functions to implement pagination
    const selectedRecipients = await selectedModel
      .find(query, "email id")
      .skip(startIndex)
      .limit(count)
      .exec();

    if (!selectedRecipients.length) {
      return next(
        new ApiError(`No recipients found matching the criteria.`, 404)
      );
    }

    let loginIndex = lastLoginIndex; // Start with the last used login index
    let emailSentCount = 0; // Track how many emails have been sent

    // Define a flag to exit the loop based on the campaign status
    let shouldPauseOrStop = false;

    // Loop through the selected recipients and send emails
    for (let i = 0; i < selectedRecipients.length; i++) {
      // Check the campaign status at the start of each loop
      drop = await Drop.findOne({ campaignName }).exec();
      if (drop.status === "paused") {
        shouldPauseOrStop = true;
        break; // Exit the loop if the campaign is paused
      }
      if (drop.status === "stopped") {
        return res.json({
          message: `Campaign ${campaignName} has been stopped.`,
        });
      }

      for (let j = 0; j < duplicate; j++) {
        // Send duplicate emails if needed
        const account = login[loginIndex];
        const emailDetails = {
          ...emailData,
          sender_email: account.email,
          sender_email_password: account.app_password,
          to: selectedRecipients[i].email, // Recipient email
          service,
        };

        // Simulate email sending (replace with actual send logic)
        await sendEmail(emailDetails);

        // Track number of sent emails and check if it's time to send to testEmail
        emailSentCount++;
        if (emailSentCount % afterTest === 0) {
          const testEmailDetails = {
            ...emailData,
            sender_email: account.email,
            sender_email_password: account.app_password,
            to: testEmail, // Test email recipient
            service,
          };

          // Send test email after every "afterTest" emails
          await sendEmail(testEmailDetails);
          console.log(
            `Test email sent to ${testEmail} after ${emailSentCount} emails.`
          );
        }

        // Move to the next login account
        loginIndex++;
        if (loginIndex >= login.length) {
          loginIndex = 0;
        }
      }

      // After each email is sent, save Drop progress in the database
      await Drop.updateOne(
        { campaignName },
        { lastStartIndex: startIndex + i + 1, lastLoginIndex: loginIndex }
      );
    }

    // If the loop is exited due to pause, send a pause response
    if (shouldPauseOrStop) {
      return res.json({
        message: `Campaign ${campaignName} is paused at index ${startIndex}.`,
      });
    }

    res.json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error(`Error in sendDrop: ${error.message}`);
    return next(new ApiError(`ERROR: Failed to send emails`, 500));
  }
});

//SEND TEST
const sendTest = expressAsyncHandler(async function (req, res) {
  const { login, recipientes, placeholders, service, ...emailData } = req.body; // Destructure input
  // Replace placeholders and random values
  replacePlaceholders(emailData, placeholders);
  replaceRandomInObject(emailData);

  // Create an array of promises for parallel email sending
  const emailPromises = login.flatMap((account) =>
    recipientes.map((recipient) => {
      // Create a copy of emailData to avoid modifying the original
      const emailDetails = {
        ...emailData,
        sender_email: account.email,
        sender_email_password: account.app_password,
        to: recipient,
        service, // Service can be 'gmail' or 'outlook'
      };

      return sendEmail(emailDetails); // Send email and return promise
    })
  );

  // Create a new Test entry
  const newTestEntry = new Test({
    campaignName: emailData.campaignName, // Assuming this is part of emailData
    mailer: emailData.mailer,
    isp: emailData.isp,
    offer: emailData.offer, // Adjust based on your emailData structure
    affiliate_network: emailData.affiliate_network,
    total: recipientes.length, // Total recipients
    opens: 0, // Initially set to 0
    clicks: 0, // Initially set to 0
  });

  // Wait for all emails to be sent
  try {
    await Promise.all(emailPromises);
    await newTestEntry.save(); // Save the email test entry after sending all emails
    res
      .status(200)
      .json({ message: "Emails sent and tests registered successfully!" });
  } catch (error) {
    console.error("Error sending emails or saving test:", error);
    res
      .status(500)
      .json({ message: "Error sending emails or saving test", error });
  }
});

async function sendEmail({
  service, // Service can be 'gmail' or 'outlook'
  sender_email,
  sender_email_password,
  to,
  cc,
  bcc,
  replyTo,
  subject,
  text,
  html,
  from,
  contentTransferEncoding = "7bit",
  date = new Date(),
  messageId,
  xSgEid,
  xEntityId,
  xFeedbackId,
  listUnsubscribe,
  mimeVersion,
  xPriority,
  xCustomHeader,
  campaignName,
}) {
  try {
    let transporter;

    // Check service and configure the transporter accordingly
    if (service === "gmail") {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: sender_email,
          pass: sender_email_password,
        },
      });
    } else if (service === "outlook") {
      transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false, // Use TLS
        auth: {
          user: sender_email, // Your Outlook email
          pass: sender_email_password, // Your Outlook password
        },
        tls: {
          ciphers: "SSLv3",
        },
      });
    } else {
      throw new Error(
        'Invalid email service provided. Use "gmail" or "outlook".'
      );
    }

    // Define mail options dynamically
    let mailOptions = {
      from: `${from} <${sender_email}>`, // Sender address with display name
      to: to || undefined,
      cc: cc || undefined,
      bcc: bcc || undefined,
      replyTo: replyTo || undefined,
      subject: subject || undefined,
      text: text || undefined,
      html: html || undefined,
      date: date, // Custom or current date
      headers: {}, // Dynamic headers
    };
    if (mailOptions.html) {
      mailOptions.html = mailOptions.html.replace(
        /\[open\]/g,
        `tracking/open?email=${to}&campaign=${campaignName}`
      );
      const trackingUrl = `tracking/click?email=${encodeURIComponent(
        to
      )}&campaign=${campaignName}&destination=${encodeURIComponent(
        "https://google.com"
      )}`;
      mailOptions.html = mailOptions.html.replace(/\[url\]/g, trackingUrl);
    }

    // Conditionally add headers only if they are provided
    if (contentTransferEncoding)
      mailOptions.headers["Content-Transfer-Encoding"] =
        contentTransferEncoding;
    if (mimeVersion) mailOptions.headers["Mime-Version"] = mimeVersion;
    if (xPriority) mailOptions.headers["X-Priority"] = xPriority;
    if (xCustomHeader) mailOptions.headers["X-Custom-Header"] = xCustomHeader;
    if (messageId) mailOptions.headers["Message-ID"] = messageId;
    if (xSgEid) mailOptions.headers["X-SG-EID"] = xSgEid;
    if (xEntityId) mailOptions.headers["X-Entity-ID"] = xEntityId;
    if (xFeedbackId) mailOptions.headers["X-Feedback-ID"] = xFeedbackId;
    if (listUnsubscribe)
      mailOptions.headers["List-Unsubscribe"] = listUnsubscribe;
    // Send the email
    let info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
  }
}

const pauseCampaign = expressAsyncHandler(async function (req, res, next) {
  const { campaignName } = req.body;

  const drop = await Drop.findOneAndUpdate(
    { campaignName },
    { status: "paused" }
  );
  if (!drop) {
    return next(new ApiError(`campaign not found: ${campaignName}`));
  }
  res.json({ message: `Campaign ${campaignName} has been paused.` });
});

const resumeCampaign = expressAsyncHandler(async function (req, res, next) {
  const { campaignName } = req.body;

  const drop = await Drop.findOneAndUpdate(
    { campaignName },
    { status: "active" }
  );
  if (!drop) {
    return next(new ApiError(`campaign not found: ${campaignName}`));
  }
  res.json({ message: `Campaign ${campaignName} has resumed.` });
});

const stopCampaign = expressAsyncHandler(async function (req, res) {
  const { campaignName } = req.body;

  try {
    await Drop.updateOne({ campaignName }, { status: "stopped" });
    res.json({ message: `Campaign ${campaignName} has been stopped.` });
  } catch (error) {
    console.error(`Error stopping campaign: ${error.message}`);
    res.status(500).json({ error: "Failed to stop campaign." });
  }
});

module.exports = {
  sendTest,
  sendDrop,
  pauseCampaign,
  resumeCampaign,
  stopCampaign,
};
