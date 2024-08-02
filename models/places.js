const mongoose = require('mongoose');

const placesSchema = mongoose.Schema({
  title: String,
  description: String,
  categorie: String,
  created_at: Date,
  created_by: _id,
  location: {},
  likes: [],
  events: [],
  google_id: String,
  comments: [],
});

const Place = mongoose.model('places', placesSchema);

module.exports = Place ;
