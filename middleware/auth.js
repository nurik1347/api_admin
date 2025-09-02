const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT tekshiruvi
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Kirish uchun token talab qilinadi' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Noto\'g\'ri yoki muddati o\'tgan token' });
  }
};

// Admin rolini tekshirish
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Faqat adminlar uchun ruxsat berilgan' });
  }
};