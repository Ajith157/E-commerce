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
const multer = require('multer');
const path = require('path');  
const fs = require('fs');     

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

dbConnection();

app.use(bodyParser.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/backend')));

const corsOptions = {
  origin: 'https://janki-design.onrender.com', // Replace with your frontend domain
  credentials: true, // Allow credentials (cookies) to be sent
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.set('trust proxy', 1);

const store = new (ConnectMongodbSession(session))({
  uri: process.env.MONGODB_URL,
  collection: "session",
  databaseName: process.env.DATABASE_NAME
});

store.on('error', function(error) {
  console.error('Session store error:', error);
});

app.use(session({
  saveUninitialized: false,
  secret: 'sessionKey',
  resave: false,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 24 * 10, 
    sameSite: 'none',
    secure: true, // Ensure this matches your environment setup
  },
}));

// Routes
app.use('/', userRoutes); 
app.use('/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Dev server running on port: ${PORT}`);
});
