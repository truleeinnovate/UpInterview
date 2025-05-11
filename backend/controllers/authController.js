const jwt = require('jsonwebtoken');
const Organization = require('../models/Organization');

const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 Login request received:', email);

  const org = await Organization.findOne({ email, password }); // In real apps, use hashed passwords
  if (!org) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ orgId: org._id, subdomain: org.subdomain }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    domain: '.upinterview.io',
  });

  console.log('✅ Login successful, token set in cookie');
  res.json({ success: true, subdomain: org.subdomain });
};

exports.validate = async (req, res) => {
  const token = req.cookies.token;
  console.log('🔍 Validating token from cookie');

  if (!token) return res.status(401).json({ error: 'Token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token valid for subdomain:', decoded.subdomain);
    res.json({ valid: true, subdomain: decoded.subdomain });
  } catch (err) {
    console.error('❌ Token invalid:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
};
