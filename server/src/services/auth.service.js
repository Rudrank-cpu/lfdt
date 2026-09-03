const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { get, run } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'eventflow_super_secret_jwt_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function registerUser({ email, password, fullName, role = 'VIEWER' }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Validate allowed roles
  const validRoles = ['HEAD', 'VIEWER'];
  const userRole = role.toUpperCase();
  if (!validRoles.includes(userRole)) {
    const err = new Error(`Invalid role '${role}'. Allowed roles are: ${validRoles.join(', ')}`);
    err.status = 400;
    throw err;
  }

  // Check if user exists
  const existing = get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  run(
    `INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)`,
    [userId, normalizedEmail, passwordHash, fullName.trim(), userRole]
  );

  const newUser = {
    id: userId,
    email: normalizedEmail,
    fullName: fullName.trim(),
    role: userRole
  };

  const token = generateToken({
    id: userId,
    email: normalizedEmail,
    full_name: fullName.trim(),
    role: userRole
  });

  return { user: newUser, token };
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

  if (!user) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    }
  };
}

function getUserProfile(userId) {
  const user = get('SELECT id, email, full_name, role, created_at FROM users WHERE id = ?', [userId]);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    createdAt: user.created_at
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
