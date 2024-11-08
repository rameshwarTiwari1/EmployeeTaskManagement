const mongoose = require('mongoose');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,  // 30 seconds
  connectTimeoutMS: 30000,          // 30 seconds
  socketTimeoutMS: 45000,           // 45 seconds
})
.then(() => {
  console.log('Successfully connected to MongoDB with Mongoose');
})
.catch(error => {
  console.error('Error connecting to MongoDB:', error);
});

