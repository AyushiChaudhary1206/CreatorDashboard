const express=require("express");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const router=express.Router();
require ("dotenv").config()


const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex'); 
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { salt, hashedPassword };
};


const verifyPassword = (password, salt, hashedPassword) => {
  const hashedInputPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  console.log('Hashed Input Password:', hashedInputPassword);
  console.log('Stored Hashed Password:', hashedPassword);
  return hashedInputPassword === hashedPassword;
};

router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email already exists');
    }

    const { salt, hashedPassword } = hashPassword(password);

    const user = new User({
      username,
      email,
      role,
      password: hashedPassword,
      salt: salt,
      credits:100
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Server error');
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
 
  // Ensure user exists and salt is available
  if (!user || !user.salt) {
    return res.status(401).send('Invalid credentials');
  }

  // Verify password using salt and stored hashed password
  if (!verifyPassword(password, user.salt, user.password)) {
    return res.status(401).send('Invalid credentials');
  }
  user.credits += 100;
  await user.save();
  // Create JWT token with userId and role
  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;

