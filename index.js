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
const ConnectMongodbSession = require('connect-mongodb-session')(session); // Initialize ConnectMongodbSession

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

dbConnection();

app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/backend')));

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true // this is important to allow credentials (cookies)
}));

app.use(cookieParser());

// Set up session middleware
app.use(session({
  secret: 'sessionKey',
  resave: false,
  saveUninitialized: false,
  store: new ConnectMongodbSession({
    uri: process.env.MONGODB_URL,
    collection: 'session',
    databaseName: process.env.DATABASE_NAME
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    secure: false, // Set it to true in production if you're using HTTPS
    sameSite: 'strict' // 'lax' might be a better option for cross-site requests
  }
}));

// Routes
app.use('/', userRoutes); 
app.use('/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
