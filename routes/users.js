var express = require("express");
var router = express.Router();
const User = require("../models/users");

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
  User.findOne({$or:[{pseudo: req.body.pseudo},{ email: req.body.email}]}).then(
    (usersData) => {
      const pseudo = req.body.pseudo;
      const token = uid2(32);
      const hash = bcrypt.hashSync(req.body.password, 10);
      const email = req.body.email;
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/gi; //regEx pour adresse @mail valable
      const emailCheck = email.match(emailRegex);
      console.log(emailCheck);
      const surname = req.body.surname;
      const name = req.body.name;
      const city = req.body.city;

      // verification champs vide
      if (!pseudo || !req.body.password || !surname || !name || !city) {
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
          avatar: "./avatars/chien_1.png",
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
          res.json({ result: true, token: data.token });
        });
      }
    }
  );
});

router.post("/signin", (req, res) => {
  User.findOne({ email: req.body.email }).then((userData) => {
    const token = uid2(32);
    const email = req.body.email;
    const password = req.body.password;

    //vérification champs vide
    if (!email || !password) {
      res.json({ result: false, error: "fill the fields" });
      return;
    }

    //verification de l'existence du compte et du mot de passe
    if (userData && bcrypt.compareSync(req.body.password, userData.password)) {
      userData.token = token;
      res.json({ result: true, token: userData.token });
    } else {
      res.json({ result: false, error: "wrong email or password" });
    }
  });
});

module.exports = router;
