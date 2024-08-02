const mongoose = require('mongoose');

const placesSchema = mongoose.Schema({
  title: String,
  description: String,
  categorie: String,
  created_at: Date,
  created_by: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  location: {latitude : String, longitude : String,},
  likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  events: [{type: mongoose.Schema.Types.ObjectId, ref: 'events'}],
  google_id: String,
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'comments'}],
});

const Place = mongoose.model('places', placesSchema);

module.exports = Place ;
