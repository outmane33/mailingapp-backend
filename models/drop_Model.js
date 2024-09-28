const { default: mongoose } = require("mongoose");
const shema = mongoose.Schema;

const dropShema = new shema(
  {
    // affilate_network: {
    //   type: String,
    //   require: [true, "affilate network required"],
    //   minlength: [2, "affilate network too short"],
    //   maxlength: [15, "affilate network too long"],
    // },
    // offer: {
    //   type: String,
    //   require: [true, "offer required"],
    // },
    // linkType: {
    //   type: String,
    //   require: [true, "link Type required"],
    //   enum: ["Routing", "Encrypted", "Encrypted Attr", "Encrypted AttrBased"],
    // },
    // staticDomain: {
    //   type: String,
    //   require: [true, "static Domain required"],
    // },
    login: [
      {
        app_password: { type: String, required: true }, // Password field
        email: { type: String, required: true }, // Email field
      },
    ],
    // contentType: {
    //   type: String,
    //   // require: [true, "Content Type required"],
    //   enum: ["text/plain", "text/html", "multipart/alternative"],
    // },
    // charset: {
    //   type: String,
    //   // require: [true, "Charset required"],
    //   enum: ["UTF-8", "us-ascii", "iso-8859-1"],
    // },
    contentTransferEncoding: {
      type: String,
      require: [true, "Tranc Enc required"],
      enum: ["7bit", "8bit", "base64", "quoted-printable"],
    },
    // header: {
    //   type: String,
    //   require: [true, "Header required"],
    // },
    text: {
      type: String,
      // require: [true, "Body required"],
    },
    html: {
      type: String,
      // require: [true, "Body required"],
    },
    // recipientes: {
    //   type: String,
    //   // require: [true, "Body required"],
    // },
    placeholders: {
      type: Map,
      of: String, // Each value in the map is a string
    },
    // rotation: {
    //   type: Number,
    // },
    // rotationCheck: {
    //   type: Boolean,
    // },
    isp: {
      type: String,
      require: [true, "isp required"],
    },
    email_type: {
      type: [String], // Array of strings
      required: true, // Ensure the array is provided
    },
    country: {
      type: String,
      // required: true,
      enum: [
        "United States",
        "Canada",
        "United Kingdom",
        "France",
        "Germany",
        "Australia",
        "India",
        "China",
        "Japan",
        "Brazil",
      ], // Add more countries as needed
      minlength: [2, "Country name is too short"],
      maxlength: [56, "Country name is too long"], // Longest country name is 56 characters (e.g., "The United Kingdom of Great Britain and Northern Ireland")
    },
    startFrom: {
      type: Number,
      require: [true, "start required"],
    },
    total: {
      type: Number,
      require: [true, "total required"],
    },
    count: {
      type: Number,
      require: [true, "count required"],
    },
    duplicate: {
      type: Number,
      require: [true, "duplicate required"],
    },
    dataListName: {
      type: String,
      require: [true, "dataListName required"],
    },
    service: {
      type: String,
      require: [true, "service required"],
    },
    testEmail: {
      type: String,
      required: true, // Set to true or false depending on your needs
    },
    afterTest: {
      type: Number,
      required: true, // Set to true or false depending on your needs
    },
    mailer: {
      type: String,
      required: true,
    },
    offer: {
      type: String,
      required: true,
    },
    // email_lists: {
    //   type: String,
    //   require: [true, "email_list_filters required"],
    // },
    // mailer: {
    //   type: String,
    //   require: [true, "mailer required"],
    //   minlength: [3, "mailer too short"],
    //   maxlength: [15, "mailer too long"],
    // },
    // delivered: {
    //   type: Number,
    // },
    // bounced: {
    //   type: Number,
    // },
    // opens: {
    //   type: Number,
    // },
    // clicks: {
    //   type: Number,
    // },
    // leads: {
    //   type: Number,
    // },
    // unsubs: {
    //   type: Number,
    // },
    from: {
      type: String,
    },
    subject: {
      type: String,
    },
    cc: {
      type: String,
    },
    bcc: {
      type: String,
    },
    replyTo: {
      type: String,
    },
    date: {
      type: String,
    },
    messageId: {
      type: String,
    },
    mimeVersion: {
      type: String,
    },
    xPriority: {
      type: String,
    },
    xCustomHeader: {
      type: String,
    },
    xSgEid: {
      type: String,
    },
    xEntityId: {
      type: String,
    },
    xFeedbackId: {
      type: String,
    },
    opens: {
      type: Number,
      default: 0, // Default value for opens
    },
    clicks: {
      type: Number,
      default: 0, // Default value for clicks
    },
    leads: {
      type: Number,
      default: 0, // Default value for clicks
    },
    unsubs: {
      type: Number,
      default: 0, // Default value for clicks
    },
    listUnsubscribe: {
      type: String,
    },
    campaignName: String,
    lastStartIndex: Number,
    lastLoginIndex: Number,
    status: { type: String, default: "active" }, // "active", "paused", "stopped"
  },

  { timestamps: true }
);

const Drop = mongoose.model("Drop", dropShema);
module.exports = Drop;
