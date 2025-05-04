const express = require('express');
const User = require('../models/User');
const Report = require('../models/Report'); // <-- Assuming you have a Report model
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/dashboard',authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -salt');
 console.log(user)
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      role: user.role,
      credits: user.credits,
      savedPosts: user.savedPosts,
      reports: user.reports
    });
  } catch (err) {
    console.error('Dashboard Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// ✅ Save a post
router.post('/save-post', authMiddleware, async (req, res) => {
  const { postId, content } = req.body;
  console.log(req.user.id)
  try {
   
    const user = await User.findById(req.user.id);
    if (!user.savedPosts.some(p => p.postId === postId)) {
      user.savedPosts.push({ postId, content });
      await user.save();
    }
    res.status(200).json({ message: 'Post saved successfully' });
  } catch (err) {
    console.error("Save post error:", err.message);
    res.status(500).json({ error: 'Failed to save post' });
  }
});

// ✅ Get saved posts
router.get('/saved-posts', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user.savedPosts || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get saved posts' });
  }
});

// 🚩 Report a post
router.post('/report-post', authMiddleware, async (req, res) => {
  const { postId, reason } = req.body;

  if (!postId || !reason) {
    return res.status(400).json({ error: 'Post ID and reason are required' });
  }

  try {
    const report = new Report({
      postId,
      reason,
      reportedBy: req.user.id,
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (err) {
    console.error("Report error:", err.message);
    res.status(500).json({ error: 'Failed to report post' });
  }
});
// ✅ Admin Dashboard: Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password -salt');
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ Admin Dashboard: Update user credits
router.put('/update-credits/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { credits } = req.body;
  if (credits === undefined || isNaN(credits)) {
    return res.status(400).json({ error: 'Credits must be a valid number' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { credits },
      { new: true, runValidators: true }
    ).select('-password -salt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User credits updated successfully',
      user,
    });
  } catch (err) {
    console.error("Credit update error:", err.message);
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

// ✅ Admin Dashboard: Get all reported posts
router.get('/reports', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    console.error("Report fetch error:", err.message);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;
