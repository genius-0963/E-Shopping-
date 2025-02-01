import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

// Import your custom modules
import connectDB from './config/db.js'; // Database connection
import productRoutes from './routes/productRoutes.js'; // Product routes
import userRoutes from './routes/userRoutes.js'; // User routes
import orderRoutes from './routes/orderRoutes.js'; // Order routes
import uploadRoutes from './routes/uploadRoutes.js'; // Upload routes
import { notFound, errorHandler } from './middleware/errorMiddleware.js'; // Error handling middleware

const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

const app = express();

// Middleware to parse JSON and URL-encoded data, and to use cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Define your API routes
app.use('/api/products', productRoutes);  // Product-related routes
app.use('/api/users', userRoutes);        // User-related routes
app.use('/api/orders', orderRoutes);      // Order-related routes
app.use('/api/upload', uploadRoutes);     // Upload-related routes

// PayPal configuration API endpoint
app.get('/api/config/paypal', (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID }) // Sends PayPal client ID from the environment variable
);

// Setting up the uploads folder for static file access
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Handle production mode for serving frontend build files
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend build folder
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  // All routes that aren't API endpoints will return the index.html file from the frontend build
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  // In development, just send a simple message
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

// Error handling middlewares (404 and global error handler)
app.use(notFound);  // 404 error handler
app.use(errorHandler); // Global error handler

// Start the server and listen on the specified port
app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);

