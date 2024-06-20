const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dbConnection = require('./db.Config/index');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const ConnectMongodbSession = require('connect-mongodb-session')(session);
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
dbConnection().then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/backend')));

// Configure CORS to allow credentials
app.use(cors({
  origin: true, // Allow all origins or specify your allowed origins
  credentials: true
}));
app.use(cookieParser());

// Configure session store
const store = new ConnectMongodbSession({
  uri: process.env.MONGODB_URL,
  collection: 'sessions',
  databaseName: process.env.DATABASE_NAME
});

store.on('error', (error) => {
  console.error('Session store error:', error);
});

// Configure sessions
app.use(
  session({
    saveUninitialized: false,
    secret:'sessionKey',
    resave: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 24 * 10,
      sameSite: 'lax', 
   
    }
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} request received for ${req.url}`);
  next();
});

// Routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
