const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
  pseudo: String,
  avatar: String,
  created_at: Date,
  private: Boolean,
  email: String,
  password: String,
  token: String,
  favorites: [],
  compagnions: [],
  contacts: [],
  discussions: [],
});

const User = mongoose.model('users', usersSchema);

module.exports = User ;
