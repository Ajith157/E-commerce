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
const ConnectMongodbSession = require('connect-mongodb-session');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
dbConnection();

// Middleware
app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/backend')));
app.use(cors()); // Allow all origins, configure as needed

app.use(cookieParser());
app.use(session({
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'sessionKey', // Use environment variable or default key
  resave: false,
  store: new (ConnectMongodbSession(session))({
    uri: process.env.MONGODB_URL,
    collection: "session",
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
