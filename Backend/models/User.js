const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  credits: { type: Number, default: 0 },
  savedPosts: [
    {
      postId: String,
      content: String,
    }
  ],
  salt: {
    type: String, // Store the salt here
    required: true,
  },
  reports: [
    {
      postId: String,
      reason: String,
      reportedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true }); // adds createdAt & updatedAt automatically

module.exports = mongoose.model('User', userSchema);
