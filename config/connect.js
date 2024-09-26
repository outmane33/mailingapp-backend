const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "config.env" });

let dataNames = [];
const dbConnection = function () {
  ataNames = [];
  mongoose.connect(process.env.CONNECTION_STRING).then(function (result) {
    console.log(`Database Connected: ${result.connection.host}`);
  });
  const db = mongoose.connection;
  db.once("open", async () => {
    // Use the underlying native MongoDB driver
    const collections = await db.db.listCollections().toArray();

    // Log the names of all collections
    collections.forEach((collection) => {
      dataNames.push(collection.name);
    });
  });
};

module.exports = { dbConnection, dataNames };
