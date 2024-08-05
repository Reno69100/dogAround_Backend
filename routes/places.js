const express = require('express');
var router = express.Router(); 
const fetch = require('node-fetch');

// const apiKey = 'AIzaSyD7kmefnloIc3Ank2T2wa5Qut4MohDNyTk';
// const latitude = 45.75; // Latitude de Lyon
// const longitude = 4.85; // Longitude de Lyon
// const radius = 50000; // Rayon en mètres
// const keyword = 'dog-friendly'; // Mot-clé pour filtrer les lieux

// const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&key=${apiKey}`;
// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=45.75,4.85&radius=50000&keyword=dog-friendly&key=AIzaSyD7kmefnloIc3Ank2T2wa5Qut4MohDNyTk
// https://places.googleapis.com/v1/places:searchNearby?locationRestriction={circle={center={latitute=${latitude},longitude=${longitude}},radius=${radius}}} 


router.post("/places/:latitude/:longitude/:radius", (req, res) => {
  const placesTypes = ['park','dog_park','pet_store','restaurant','national_park','veterinary_care' ]
  const params = `locationRestriction.circle.center.latitude=${req.params.latitude}&locationRestriction.circle.center.longitude=${req.params.longitude}&locationRestriction.circle.radius=${req.params.radius}&includedTypes=${placesTypes}`
  fetch(`https://places.googleapis.com/v1/places:searchNearby?${params} `, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json', 
        'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.location,places.allowsDogs,places.types',
    },
  })
  .then(response => response.json())
  .then(data => {
    const places = data.places.filter(e=>e.displayName.languageCode='fr')
    res.status(200).json({ result: true, places });
  })
}

module.exports = router;