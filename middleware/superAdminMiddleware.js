const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');

exports.protectSuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.superAdmin = await SuperAdmin.findById(decoded.id).select('-adminPassword');

    if (!req.superAdmin) {
      return res.status(401).json({ message: 'Super Admin not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
