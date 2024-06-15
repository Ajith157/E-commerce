module.exports = {
  adminAuth: (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  },

  userAuth: (req, res, next) => {
     
    if (req.session.user) {
      next();
    } else {
      console.error('User not authenticated or missing _id');
      res.status(401).json({ error: 'Unauthorized' });
    }
  },
};
  