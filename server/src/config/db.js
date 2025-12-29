const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    throw new Error('Missing MongoDB connection string');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

module.exports = { connectDB };
