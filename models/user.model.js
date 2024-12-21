const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // Real name of the user
  },
  username: {
    type: String,
    required: true,
    unique: true,  // Unique username for identification
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Unique email for login
  },
  password: {
    type: String,
    required: true,  // Encrypted password
  },
  post:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:'post'
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
