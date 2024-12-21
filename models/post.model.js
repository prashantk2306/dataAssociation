const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // References the User model, this will store the user who created the post
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // References the User model for likes, this will store users who liked the post
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const post = mongoose.model('Post', postSchema);

module.exports = post;
