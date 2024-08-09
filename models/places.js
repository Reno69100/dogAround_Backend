const mongoose = require('mongoose');

const placesSchema = mongoose.Schema({
  title: String,
  description: String,
  hours: [],
  categorie: String,
  created_at: Date,
  created_by: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  location: {latitude : String, longitude : String,},
  likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
  nbLike: Number,
  events: [{type: mongoose.Schema.Types.ObjectId, ref: 'events'}],
  google_id: String,
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'comments'}],
  image: String,
});

const Place = mongoose.model('places', placesSchema);

module.exports = Place ;
