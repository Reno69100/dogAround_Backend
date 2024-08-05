const mongoose = require('mongoose');

const usersSchema = mongoose.Schema({
  pseudo: String,
  avatar: String,
  created_at: Date,
  private: Boolean,
  email: String,
  password: String,
  token: String,
  surname: String,
  name: String,
  city: String,
  favorites: [{type: mongoose.Schema.Types.ObjectId, ref: 'places'}],
  companions: [{name : String, dogBreed : String, weight : Number, sex : String, comment: String,}],
  contacts: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  discussions: [{type: mongoose.Schema.Types.ObjectId, ref: 'discussions'}],
});

const User = mongoose.model('users', usersSchema);

module.exports = User ;
