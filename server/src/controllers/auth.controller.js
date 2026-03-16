/**
 * Auth Controller — Register & Login with JWT
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * POST /api/auth/register
 */
async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required',
      data: null,
    });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists',
      data: null,
    });
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash: password, // Will be hashed by pre-save hook
  });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token },
  });
}

/**
 * POST /api/auth/login
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      data: null,
    });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      data: null,
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      data: null,
    });
  }

  const token = signToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
}

module.exports = { register, login };
