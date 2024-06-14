module.exports = {
  adminAuth: (req, res, next) => {
    if (req.session.admin) {
      console.log('Admin authenticated:', req.session.admin);
      next();
    } else {
      console.error('Admin not authenticated');
      res.status(401).json({ error: 'Unauthorized' });
    }
  },

  userAuth: (req, res, next) => {
    if (req.session.user) {
      console.log('User authenticated:', req.session.user);
      next();
    } else {
      console.error('User not authenticated or missing _id');
      res.status(401).json({ error: 'Unauthorized' });
    }
  },
};
