const express = require('express');
var router = express.Router();
const fetch = require('node-fetch');

import Place from '../models/places';

// const apiKey = 'AIzaSyD7kmefnloIc3Ank2T2wa5Qut4MohDNyTk';
// const latitude = 45.75; // Latitude de Lyon
// const longitude = 4.85; // Longitude de Lyon
// const radius = 50000; // Rayon en mètres
// const keyword = 'dog-friendly'; // Mot-clé pour filtrer les lieux

// const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&key=${apiKey}`;
// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=45.75,4.85&radius=50000&keyword=dog-friendly&key=AIzaSyD7kmefnloIc3Ank2T2wa5Qut4MohDNyTk
// https://places.googleapis.com/v1/places:searchNearby?locationRestriction={circle={center={latitute=${latitude},longitude=${longitude}},radius=${radius}}} 
// const keywords = "dog-friendly park OR dog park OR dog-friendly beach OR dog-friendly trail OR dog-friendly hiking OR dog-friendly outdoor area OR dog-friendly lake OR dog-friendly nature reserve OR dog-friendly campground OR dog-friendly picnic area";


//Route POST pour récupérer les points d'intérêts, et évenements autour de l'utilisateur
router.post("/:latitude/:longitude/:radius", (req, res) => {
  //Vérification des params de la route
  if ((req.params.latitude === null) || (req.params.latitude === null) || (req.params.latitude === null)) {
    res.status(400).json({ result: false, error: "problem route post places/:latitude/:longitude/:radius" });
    return;
  }

  //Déclaration categories a recuperer sur Google maps
  const placesTypes = ['park', 'dog_park', 'pet_store', 'restaurant', 'national_park', 'veterinary_care'];

  //Ecriture query includedTypes
  let dataTypes = '';
  for (const element of placesTypes) {
    dataTypes += `&includedTypes=${element}`
  }

  //Ecriture globale query en fonction de la latitude, longitude, rayon autour de l'utilisateur, et la categories des places voulues
  const params = `locationRestriction.circle.center.latitude=${req.params.latitude}&locationRestriction.circle.center.longitude=${req.params.longitude}&locationRestriction.circle.radius=${req.params.radius}${dataTypes}`

  //Requete API google
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
      //Déclaration categories côté frontend
      const categories = [
        ['park', "parc"],
        ['dog_park', "parc"],
        ['national_park', "parc"],
        ['pet_store', "animalerie"],
        ['restaurant', "restaurant"],
        ['veterinary_care', "veterinaire"],
        ['', "air"],
        ['', "eau"],
        ['', "like"],
        ['', "favori"],
        ['', "event"],
      ];

      //Mise en forme des données à renvoyer au front end
      const places = data.places.map(e => {

        //Conversion du type google en type utilsable côté frontend
        let typefilter = '';
        for (const googletype of e.types) {
          for (const element of categories) {
            if (googletype.toLowerCase() === element[0].toLowerCase()) {
              typefilter = element[1].toLowerCase();
              /* console.log(typefilter); */
              break;
            }
          }
        }
        if (typefilter.length === 0) {
          typefilter='autre'
        }

        //Schema objet nouvelle places à renovyer au frontend
        const newPlace = {
          id: '',
          google_id: e.id,
          location: e.location,
          type: typefilter,
          events: [],
          likes: [],
        }

        return newPlace;
      })

      //Réponse route
      res.status(200).json({ result: true, places });
    })
})


router.get('/id/:id', (req, res) => {
  Place.findOne({_id: req.params.id}.then((data) => {
    res.json({result: true, places: data})
  }))
})

router.post('./favori/:idgoogle/:token', (req, res) => {
  Place.findOne({google_id: req.params.idgoogle, token: req.params.token}.then((data) => {
    if(data){
      const googleId= req.params.idgoogle
      const apiKey = process.env.GOOGLE_API_KEY
      fetch(`https://places.googleapis.com/v1/places/${googleId}?fields=id,displayName&key=${apiKey}`)
      .then(response => response.json())
        .then(placeData => {
          const newPlace = new Place({
            title: req.body.title,
            description: req.body.description,
            catégorie: req.body.categories,
            created_at: new Date ,
            google_id: req.params.idgoogle
    
          })
          newPlace.save().then((data)=> {
            res.json({result: true, message: 'created'})
          })

        })
     

    }else{
      res.json({result: false, message: 'already exists'})
    }
  })
)})

module.exports = router;

//&includedTypes=${placesTypes}
//,'dog_park','pet_store','restaurant','national_park','veterinary_care'
//encodeURIComponent(keyword)

// const keywords = [
//   "dog-friendly swimming area",
//   "dog-friendly lake",
//   "dog-friendly beach",
//   "dog-friendly pond",
//   "dog-friendly river",
//   "dog-friendly public park",
//   "dog-friendly park",
//   "dog-friendly private park",
//   "private dog park",
//   "dog area",
//   "dog park",
//   "dog-friendly area",
//   "dog-friendly trail",
//   "dog-friendly hiking",
//   "dog walking area",
//   "dog-friendly outdoor area"
// ];
