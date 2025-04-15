var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/"; // Try connecting without a specific database initially

console.log("Attempting to connect to MongoDB...");

MongoClient.connect(url, function(err, client) {
  console.log("MongoClient.connect callback executed.");
  if (err) {
    console.error("Error connecting to MongoDB:", err);
    return;
  }
  console.log("Successfully connected to MongoDB server.");
  client.close();
});

console.log("After calling MongoClient.connect.");