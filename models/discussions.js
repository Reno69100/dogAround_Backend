const mongoose = require('mongoose');

const discussionsSchema = mongoose.Schema({
  user : id_,
  date : Date,
  message : String,
});

const Discussion = mongoose.model('discussions', discussionsSchema);

module.exports = Discussion ;
