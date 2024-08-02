const mongoose = require('mongoose');

const commentsSchema = mongoose.Schema({
  created_by : id_,
  created_at : Date,
  title : String,
  comment : String,
});

const Comment = mongoose.model('comments', commentsSchema);

module.exports = Comment ;
