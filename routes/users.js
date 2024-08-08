var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Place = require('../models/places')

const uid2 = require("uid2");
const bcrypt = require("bcrypt");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/signin", (req, res) => {
  User.find().then((data) => {
    res.json({ result: true, user: data });
  });
});

// router.get('/signup', (req, res) => {
//   User.find().then(data => {
//     res.json({ result: true, user: data });

//   });
// });

router.get("/signup", (req, res) => {
  User.findOne({ peudo: req.body.pseudo }).then((data) => {
    res.json({ result: true, user: data });
    console.log("data = " + data);
  });
});
//route pour SignUp

router.post("/signup", (req, res) => {
  //'$or:' == '||' ; findOne({pseudo:req.body.pseudo} || {email: req.body.email})
  User.findOne({
    $or: [{ pseudo: req.body.pseudo }, { email: req.body.email }],
  }).then((usersData) => {
    const pseudo = req.body.pseudo;
    const token = uid2(32);
    const hash = bcrypt.hashSync(req.body.password, 10);
    const email = req.body.email;
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi; //regEx pour adresse @mail valable
    const surname = req.body.surname;
    const name = req.body.name;
    const city = req.body.city;
    const avatar = req.body.avatar;

    // verification champs vide
    if (!pseudo || !req.body.password || !email) {
      res.json({ result: false, error: "fill the fields" });
      return;
    }

    //verification @mail valide
    if (!emailRegex.test(email)) {
      res.json({ result: false, error: "invalid @mail adress" });
      return;
    }
    //verification si le compte existe déja
    if (usersData) {
      res.json({ result: false, error: "username or @mail already used" });
      return;
    }

    //creation nouvel utilisateur dans la BDD
    if (usersData === null) {
      const newUser = new User({
        pseudo: pseudo,
        avatar: avatar,
        created_at: new Date(),
        private: false,
        email: email,
        password: hash,
        token: token,
        surname: surname,
        name: name,
        city: city,
      });
      newUser.save().then((data) => {
        res.json({
          result: true,
          pseudo: data.pseudo,
          city: data.city,
          token: data.token,
          avatar: data.avatar
        });
      });
    }
  });
});


router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  // Vérifier que les champs ne sont pas vides
  if (!email || !password) {
    return res.json({ result: false, error: "fill the fields" });
  }

  // Chercher l'utilisateur par email
  User.findOne({ email })
    .then((userData) => {
      if (userData && bcrypt.compareSync(password, userData.password)) {
        const token = uid2(32);
        userData.token = token;
        userData
          .save()
          .then(() => {
            res.json({
              result: true,
              token: userData.token,
              pseudo: userData.pseudo,
              city: userData.city,
              avatar: userData.avatar
            });
          })
      } else {
        res.json({ result: false, error: "wrong email or password" });
      }
    })
});


router.get("/", (req, res) => {
  User.findOne({ peudo: req.body.pseudo }).then((data) => {
    res.json({ result: true, user: data });
    console.log("data = " + data);
  });
});

//route pour modifier les champs modifiable du profile utilisateur
/* router.put("/update", (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10);

  // Mise à jour de l'utilisateur avec les champs modifiés
  User.findOneAndUpdate(
    { token: req.body.token },
    {
      $set: {
        pseudo: req.body.pseudo,
        email: req.body.email,
        surname: req.body.surname,
        password: hash,
        name: req.body.name,
        city: req.body.city,
      },
    },
    { new: true }
  ).then((data) => {
    if (data) {
      res.json({ result: true, user: data });
    } else {
      res.json({ result: false, message: "Utilisateur non trouvé" });
    }
  });
}); */

router.put("/update", (req, res) => {
  const update = {};

  // Vérifier chaque champ modifiable et ajouter à update seulement s'il est fourni
  if (req.body.pseudo) update.pseudo = req.body.pseudo;
  if (req.body.email) update.email = req.body.email;
  if (req.body.surname) update.surname = req.body.surname;
  if (req.body.name) update.name = req.body.name;
  if (req.body.city) update.city = req.body.city;
  if (req.body.avatar) update.avatar = req.body.avatar;

  // Hachage du mot de passe si un nouveau mot de passe est fourni
  if (req.body.password) {
    const hash = bcrypt.hashSync(req.body.password, 10);
    update.password = hash;
  }

  // Mise à jour de l'utilisateur avec les champs modifiés
  User.findOneAndUpdate(
    { token: req.body.token },
    { $set: update },
    { new: true }
  ).then((data) => {
    if (data) {
      res.json({ result: true, user: data });
    } else {
      res.json({ result: false, message: "Utilisateur non trouvé" });
    }
  });
});

//route post /user/companions/update => ajout/mise à jour d'un nouveau compagnon
router.post("/companions/update", async (req, res) => {
  //Déclaration nouveau compagnon
  const newCompanion = {
    avatar: req.body.avatar,
    name: req.body.name,
    dogBreed: req.body.dogBreed,
    weight: req.body.weight,
    sex: req.body.sex,
    comment: req.body.comment
  };

  //Message d'erreur
  if (!newCompanion.name) {
    return res.json({ result: false, error: "Veuillez entrer au moins le nom de votre compagnon!" });
  }

  //Mise à jour compagnon
  await User.findOneAndUpdate(
    { token: req.body.token, companions: { name: newCompanion.name} },
    { $set: { companions: [newCompanion] } })
    .then((data) => {
      console.log(data)
      if (data) {
        res.json({ result: true });
        return;
      } 
    });

  //Ajout compagnon
  User.findOneAndUpdate(
    { token: req.body.token },
    { $push: { companions: newCompanion } })
    .then((data) => {
      if (data) {
        res.json({ result: true });
      } else {
        res.json({ result: false, error: "Utilisateur non trouvé" });
      }
    });
});

//route post /user/companions => recuperation infos companions
router.post("/companions", (req, res) => {
  //Récupération liste compagnon
  User.findOne(
    { token: req.body.token })
    .then((data) => {
      if (data) {
        const companions = data.companions.map(e => {
          return {
            avatar: e.avatar,
            name: e.name,
            dogBreed: e.dogBreed,
            weight: e.weight,
            sex: e.sex,
            comment: e.comment
          }
        })
        res.json({ result: true, companions });
      } else {
        res.json({ result: false, error: "Utilisateur non trouvé" });
      }
    });
});
router.get('/favori/:id/', (req, res) => {
  Place.findOne({token: req.params.id})
    .then((dataPlace) => {
      console.log(dataPlace)
      if(!dataPlace){
        User.findOne({token: req.body.token}).then((userData) => {
          console.log(userData)
          res.json({result: true, user: userData})

      
        })

      }
    })
})

// route .put pour voir si l'el à FAV est dans la BDD puis rajouter son idgoogleID dans le fav. du User
router.put('/favori/:id', (req, res) => {
  
      User.findOne({token: req.body.token}).then((userData) => {

        if(userData){
          User.updateOne(
            {token: req.params.token},
            { $push: { favorites: req.params.id }}
           ).then(() => {
            res.json({result: true,})
          })
        }else{
          res.json({result: false, errof: 'already exists'})
        }
      })
    }
  )




    
    

    


module.exports = router;
