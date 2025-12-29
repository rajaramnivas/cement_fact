require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('../server/src/config/db');
const authRoutes = require('../server/src/routes/authRoutes');
const productRoutes = require('../server/src/routes/productRoutes');
const orderRoutes = require('../server/src/routes/orderRoutes');

let app;

// Initialize app once
async function initializeApp() {
  if (app) return app;

  app = express();

  try {
    await connectDB(process.env.MONGODB_URI);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }

  app.use(cors({
    origin: '*',
    credentials: true
  }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'cement-steel-backend' });
  });

  app.use('/auth', authRoutes);
  app.use('/products', productRoutes);
  app.use('/orders', orderRoutes);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}

// Vercel serverless handler
module.exports = async (req, res) => {
  const handler = await initializeApp();
  handler(req, res);
};
