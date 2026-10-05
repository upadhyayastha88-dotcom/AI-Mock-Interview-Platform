const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mock_interview';
  try {
    console.log(`Attempting to connect to MongoDB: ${uri}...`);
    // Connect with a 3 second timeout so the server doesn't hang if MongoDB isn't running locally
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.warn('MongoDB connection failed or not running locally:', err.message);
    console.log('Falling back seamlessly to local persistent JSON database (data/interviews.json).');
  }
};

module.exports = connectDB;
