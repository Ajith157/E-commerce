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

app.use(cors());

app.use(cookieParser());
app.use(session({
  saveUninitialized: false,
  secret: 'sessionKey',
  resave: false,
  store: new (ConnectMongodbSession(session))({
    uri: process.env.MONGODB_URL,
    collection: "session",
    databaseName: process.env.DATABASE_NAME
  }),
  cookie: {
    maxAge: 1000 * 60 * 24 * 10, 
  },
}));



// Routes
app.use('/', userRoutes); 
app.use('/admin', adminRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Dev server running on port: ${PORT}`);
});
