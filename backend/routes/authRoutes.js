import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { usersDb } from './mockStore.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'novahub_hyper_secure_secret_token_1337';

// Middleware to extract user from JWT
export const authenticateToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Access denied. No session token found.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired session token.' });
  }
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, activeTeam } = req.body;

    // MOCK DB FALLBACK
    if (process.env.USE_MOCK_DB === 'true') {
      const existingUser = usersDb.find(u => u.email === email || u.username === username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username or Email is already in use.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'mock-user-' + Math.random().toString(36).substring(2, 9),
        username,
        email,
        password: passwordHash,
        role: role || 'participant',
        activeTeam: activeTeam || ''
      };

      usersDb.push(newUser);

      const token = jwt.sign(
        { id: newUser._id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(201).json({
        message: 'Registration successful (MOCK DB MODE)',
        user: { id: newUser._id, username: newUser.username, role: newUser.role, email: newUser.email, activeTeam: newUser.activeTeam }
      });
    }

    // MONGOOSE DB FLOW
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email is already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      role: role || 'participant',
      activeTeam: activeTeam || ''
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Registration successful',
      user: { id: newUser._id, username: newUser.username, role: newUser.role, email: newUser.email, activeTeam: newUser.activeTeam }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // MOCK DB FALLBACK
    if (process.env.USE_MOCK_DB === 'true') {
      let user = usersDb.find(u => u.email === email);
      
      // Auto-register mock users dynamically if they don't exist yet for smooth demo UX
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        user = {
          _id: 'mock-user-' + Math.random().toString(36).substring(2, 9),
          username: email.split('@')[0],
          email,
          password: passwordHash,
          role: 'host' // default to host for full demo access
        };
        usersDb.push(user);
      } else {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid email or password credentials.' });
      }

      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        message: 'Login successful (MOCK DB MODE)',
        user: { id: user._id, username: user.username, role: user.role, email: user.email, activeTeam: user.activeTeam || '' }
      });
    }

    // MONGOOSE DB FLOW
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password credentials.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password credentials.' });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, username: user.username, role: user.role, email: user.email, activeTeam: user.activeTeam || '' }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login server error', error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Session terminated successfully.' });
});

// Me Profile Check
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // MOCK DB FALLBACK
    if (process.env.USE_MOCK_DB === 'true') {
      const user = usersDb.find(u => u._id === req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      const { password, ...safeUser } = user;
      return res.status(200).json(safeUser);
    }

    // MONGOOSE DB FLOW
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Profile check server error.' });
  }
});

export default router;
