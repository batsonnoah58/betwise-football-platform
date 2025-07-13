exports.handler = async (event) => {
  // Parse and verify IPN from Pesapal
  // Update your database accordingly
  // Respond with 200 OK
  return {
    statusCode: 200,
    body: "IPN received",
  };
}; 