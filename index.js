const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const ConnectMongoDBSession = require('connect-mongodb-session')(session);
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS setup
app.use(cors({
  origin: true, // Allow all origins or specify your allowed origins
  credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1); // Exit the process on connection failure
});

// Session store setup using connect-mongodb-session
const store = new ConnectMongoDBSession({
  uri: process.env.MONGODB_URL,
  collection: 'sessions',
  databaseName: process.env.DATABASE_NAME
});

store.on('error', (error) => {
  console.error('Session store error:', error);
});

// Session middleware setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 10, // Session max age in milliseconds (e.g., 10 days)
    sameSite: 'lax', // Strict CSRF protection
    secure: false // Set to true in production for HTTPS
  }
}));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} request received for ${req.url}`);
  next();
});

// Routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/', userRoutes); // Example user routes
app.use('/admin', adminRoutes); // Example admin routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
