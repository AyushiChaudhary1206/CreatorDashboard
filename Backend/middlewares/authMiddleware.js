const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication Middleware (checks token and user)
const authMiddleware = async (req, res, next) => {
  try {
   
    const token = req.header('authorization')?.split(' ')[1]; // Expecting "Bearer <token>"
console.log(token);
  
    if (!token) {
      return res.status(401).json({ message: 'No token provided, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password -salt'); // Exclude password and salt

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token, access denied' });
  }
};

const adminMiddleware = (req, res, next) => {

  if (!req.user) {
    return res.status(403).json({ message: 'Access forbidden: Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access forbidden: Admins only' });
  }

  next();
};

module.exports = { authMiddleware, adminMiddleware };
