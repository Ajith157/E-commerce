module.exports = {
  adminAuth: (req, res, next) => {
    try {
      if (req.session.admin) {
        next();
      } else {
        throw new Error('Unauthorized');
      }
    } catch (error) {
      console.error('Error in adminAuth middleware:', error);
      if (error.message === 'Unauthorized') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  },

  userAuth: (req, res, next) => {
    try {
      if (req.session.user) {
        next();
      } else {
        throw new Error('Unauthorized');
      }
    } catch (error) {
      console.error('Error in userAuth middleware:', error);
      if (error.message === 'Unauthorized') {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  },
};
