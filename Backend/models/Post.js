const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  body: String,
  source: String,
});

module.exports = mongoose.model('Post', PostSchema);
