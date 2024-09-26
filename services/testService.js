const testService = (req, res) => {
  const receivedData = req.body;
  console.log("Data received:", receivedData);

  // Send a response back to the client
  res.json({ message: "Data received successfully", data: receivedData });
};

module.exports = { testService };
