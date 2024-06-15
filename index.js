// index.js

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
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
dbConnection();

// Middleware
app.use(cors()); // Allow all origins, configure as needed
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/backend')));

// bodyParser middleware should be applied before the routes
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use(cookieParser());
app.use(session({
  saveUninitialized: false,
  secret:  'sessionKey', // Use environment variable or default key
  resave: false,
  store: new ConnectMongoDBSession({
    uri: process.env.MONGODB_URL,
    collection: "sessions",
    databaseName: process.env.DATABASE_NAME
  }),
  cookie: {
    maxAge: 1000 * 60 * 24 * 10, 
    // Set domain dynamically based on environment
    // domain: process.env.COOKIE_DOMAIN || 'yourdomain.com',
    // secure: true, // Uncomment if using HTTPS
    // httpOnly: true, // Better security
  },
}));

// Routes
app.use('/', userRoutes); 
app.use('/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
