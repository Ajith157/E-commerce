const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dbConnection = require('./db.Config/index');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const ConnectMongoDBSession = require('connect-mongodb-session')(session);
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
dbConnection();

// Configure CORS
app.use(cors()); // Allow all origins - You can modify this as per your requirements

// Other middleware
app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/backend')));
app.use(cookieParser());
app.set('trust proxy', 1);

// Initialize session store
const sessionStore = new ConnectMongoDBSession({
  uri: process.env.MONGODB_URL,
  collection: 'sessions', // Collection name for sessions
  databaseName: process.env.DATABASE_NAME,
  expires: 1000 * 60 * 60 * 24 * 10, // Session expiration time (10 days)
});

app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 24 * 10, // Session expiration time (10 days)
    sameSite: 'none', // Ensure cookies are sent in cross-origin requests
    secure: true, // Set secure flag if using HTTPS
  },
}));

// Routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
