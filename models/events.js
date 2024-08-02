const mongoose = require('mongoose');

const eventsSchema = mongoose.Schema({
  created_by : id_,
  created_at : Date,
  title : String,
  description : String,
  dates : [],
  comments: [],
});

const Event = mongoose.model('events', eventsSchema);

module.exports = Event ;
