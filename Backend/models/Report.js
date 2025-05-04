// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  postId: String,
  reason: String,
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
