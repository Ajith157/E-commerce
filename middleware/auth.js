// auth.js
module.exports = {
  adminAuth: (req, res, next) => {
      console.log("Admin Authentication Middleware");
      console.log("Session Data:", req.session);
      if (req.session.admin) {
          next();
      } else {
          console.log("Unauthorized Access");
          res.status(401).json({ error: 'Unauthorized' });
      }
  },

  userAuth: (req, res, next) => {
      console.log("User Authentication Middleware");
      console.log("Session Data:", req.session);
      if (req.session.user) {
          next();
      } else {
          console.error('User not authenticated or missing _id');
          res.status(401).json({ error: 'Unauthorized' });
      }
  },
};


  