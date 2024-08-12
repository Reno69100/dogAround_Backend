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
  companions: [{avatar: String, name : String, dogBreed : String, weight : Number, sex : Number, comment: String,}],
  contacts: [{"user_id": {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    "discussion_id": {type: mongoose.Schema.Types.ObjectId, ref: 'discussions'},
    invitation : String}],
  /* discussions: [{type: mongoose.Schema.Types.ObjectId, ref: 'discussions'}], */
});

const User = mongoose.model('users', usersSchema);

module.exports = User ;