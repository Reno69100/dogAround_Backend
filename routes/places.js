const express = require('express');
var router = express.Router();
const fetch = require('node-fetch');

const User = require('../models/users')
const Place = require('../models/places')
// const apiKey = 'AIzaSyD7kmefnloIc3Ank2T2wa5Qut4MohDNyTk';
// const latitude = 45.75; // Latitude de Lyon
// const longitude = 4.85; // Longitude de Lyon
// const radius = 50000; // Rayon en mètres
// const keyword = 'dog-friendly'; // Mot-clé pour filtrer les lieux

// const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&key=${apiKey}`;
// https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=45.75,4.85&radius=50000&keyword=dog-friendly&key=AIzaSyD7kmefnloIc3Ank2T2wa5Qut4MohDNyTk
// https://places.googleapis.com/v1/places:searchNearby?locationRestriction={circle={center={latitute=${latitude},longitude=${longitude}},radius=${radius}}} 
// const keywords = "dog-friendly park OR dog park OR dog-friendly beach OR dog-friendly trail OR dog-friendly hiking OR dog-friendly outdoor area OR dog-friendly lake OR dog-friendly nature reserve OR dog-friendly campground OR dog-friendly picnic area";

//Déclaration categories a recuperer sur Google maps
const placesTypes = ['park', 'dog_park', 'pet_store', 'restaurant', 'national_park', 'veterinary_care'];

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
  ['', "utilisateur"],
  ['', "event"],
];

//Route get pour récupérer les points d'intérêts, et évenements autour de l'utilisateur
router.get("/position/:latitude/:longitude/:radius", (req, res) => {
  //Vérification des params de la route
  if ((req.params.latitude === null) || (req.params.longitude === null) || (req.params.radius === null)) {
    res.status(400).json({ result: false, error: "problem route get places/position/:latitude/:longitude/:radius" });
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
      //Mise en forme des données à renvoyer au front end
      if (data) {
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
            typefilter = 'autre'
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
      }
      else {
        //Réponse route
        res.status(200).json({ result: true, message: "Pas de résultat" });
      }

    })
})

/* //Route get pour récupérer les points d'intérêts, et évenements autour de la ville demandé par l'utilisateur
router.get("/city/:city/:radius", (req, res) => {
  //Vérification des params de la route
  if ((req.params.city === null) || (req.params.radius === null)) {
    res.status(400).json({ result: false, error: "problem route get /city/:city/:radius" });
    return;
  }

  //Query recherche du lieu
  const textQuery = req.params.city;

  //Query recherche des coordonnées de la ville
  const params = `textQuery=${req.params.city}`;

  console.log(params)
  //Requete API google
  fetch(`https://places.googleapis.com/v1/places:searchText?${params}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.location',
    },
  })
    .then(response => response.json())
    .then(data => {
      //Réponse route
      res.status(200).json({ result: true, location : data.places[0].location });
    })
}) */

// router.get('/id/:google_id', (req, res) => {
//   Place.findOne({ google_id: req.params.google_id }).then((placeData) => {

//     if (placeData) {
//       res.json({ result: true, place: placeData })
//     } else {
//       res.json({ result: false, error: 'no registered location' })
//     }
//   })

// })

//route permettant de récupérer les informations de l'API google sur le lieu dont on a récupéré le google_id
router.get('/id/:google_id', (req, res) => {
    const google_id = req.params.google_id
      fetch(`https://places.googleapis.com/v1/places/${google_id}?languageCode=fr`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'displayName,photos,location,regularOpeningHours,formattedAddress,primaryType,editorialSummary',
        },
      })
        .then(response => response.json())
        .then(placeData => {
          console.log('Place Data : ' + placeData)

          res.json({
            result: true,
            //  places: placeData,
            place: {
              _id: req.params.id,
              image: placeData?.photos[0]?.authorAttributions[0]?.uri || 'non disponible',
              nom: placeData?.displayName?.text || 'non disponible',
              adresse: placeData?.formattedAddress || 'non disponible',
              horaires: placeData?.regularOpeningHours?.weekdayDescriptions[0] || 'non disponible',
              categorie: placeData?.primaryType || 'non disponible',
              description: placeData?.editorialSummary?.text || 'non disponible',
              location: { latitude: placeData?.location?.latitude || 'non disponible', longitude: placeData?.location?.longitude || 'non disponible' },           
            }
          })

        })
    }
  )


//route pour enregistrer un nouveau POI dans la BDD par l'utilisateur

router.post('/new/:google_id/:location', (req, res) => {
  Place.findOne({ google_id: req.params.google_id, location: req.params.location, categorie: req.body.categorie }).then((data) => {
    const google_id = req.params.google_id;
    const title = req.body.title
    const location = req.params.location
    const categorie = req.body.categorie

    if (!google_id || !title || !location || !categorie) {
      res.json({ result: false, message: 'Fill the Fields' })
    }

    if (data) {
      res.json({ result: false, message: 'POI already exists' })
      return
    }

    if (!data) {

      fetch(`https://places.googleapis.com/v1/places/${google_id}?languageCode=fr`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'displayName,photos,location,regularOpeningHours,primaryType,editorialSummary',
        },
      })
        .then(response => response.json())
        .then(placeData => {
          const newPlace = new Place({
            title: req.params.title,
            description: req.body.description,
            hours: placeData.regularOpeningHours.weekdayDescriptions,
            categorie: 'Autre',
            created_at: new Date(),
            location: { latitude: placeData.location.latitude, longitude: placeData.location.longitude },
            google_id: req.params.google_id,
            image: placeData.photos[0].name,
          })
          newPlace.save().then((data) => {
            res.json({
              result: true,
              title: data.title,
              description: data.description,
              hours: data.hours,
              categorie: data.categorie,
              created_at: data.created_at,
              location: data.location,
              google_id: data.google_id,
              image: data.image,
            });
          })
  

  
      })
  }
})
})




// route .put pour voir si l'_id du User est dans la BDD du Like du Place
// puis rajouter ou supprimer l'_id en fonction de sa présence dans le Like
router.put('/like/:id', (req, res) => {

  // recherche du lieu/id
  Place.findById(req.params.id).then(place => {
    console.log(place.like)
    if (!place) {
      res.json({ result: false, error: 'Place not found' });
      return;
    }

    // recherche de l'utilisateur/token
    User.findOne({ token: req.body.token }).then(user => {
      if (user === null) {
        res.json({ result: false, error: 'User not found' });
        return;
      }

      // si _id du User est présent dans les Likes du Place, supprimer l'_id
      if (place.likes.includes(user._id)) { // User already liked the tweet
        Place.updateOne({ _id: req.params.id }, { $pull: { likes: user._id } }) // Remove user ID from likes
          .then((data) => {
            res.json({ result: true, message: 'Like Removed', user: data });
          });

        // Sinon ajouter l'_id dans le Like car non présent
      } else {
        Place.updateOne({ _id: req.params.id }, { $push: { likes: user._id } })
          .then((data) => {
            res.json({ result: true, message: 'Like Added', user: data });
          });
      }
    });
  });
})





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
