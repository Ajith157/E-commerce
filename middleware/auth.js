module.exports = {
  adminAuth: (req, res, next) => {
    try {
      if (req.session.admin) {
        next();
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error in adminAuth middleware:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  userAuth: (req, res, next) => {
    try {
      if (req.session.user) {
        next();
      } else {
        console.error('User not authenticated or missing _id');
        res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      console.error('Error in userAuth middleware:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

  