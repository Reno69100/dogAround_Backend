const mongoose = require('mongoose');

const eventsSchema = mongoose.Schema({
  created_by : id_,
  created_at : Date,
  title : String,
  description : String,
  dates : [Date],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'comments'}],
});

const Event = mongoose.model('events', eventsSchema);

module.exports = Event ;
