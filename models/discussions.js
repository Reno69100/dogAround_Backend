const mongoose = require('mongoose');

const discussionsSchema = mongoose.Schema({
  messages : [{"user_id": {type: mongoose.Schema.Types.ObjectId, ref: 'users'}, date : Date, message: String,}]
});

const Discussion = mongoose.model('discussions', discussionsSchema);

module.exports = Discussion ;
