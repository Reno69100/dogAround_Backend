var express = require('express');
var router = express.Router();

const User = require('../models/users')

const uid2 = require('uid2');
const bcrypt = require('bcrypt');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/signIn', (req,res) => {
  User.find().then(data => {
    res.json({result: true, user: data});

  });
});

router.post('/signIn', (req, res) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g ;
  User.findOne({pseudo: req.body.pseudo, email: req.body.email}).then(userData => {
    const pseudo = req.body.pseudo
    const passwordCheck = req.body.password.Match(emailRegex)
    const hash = bcrypt.hashSync(req.body.password, 10)

    if(!pseudo || !req.body.password){
      res.json({result: false, error: 'fill the fields'})

    }else if (userData){
      res.json({result: false, error: 'username or @mail already used'})
      
    }else if(passwordCheck){
      res.json({result:false, error:'invalid @mail adress' })

    }else{
      const newUser = new User({
        pseudo: req.body.pseudo,
        avatar: req.body.avatar,
        created_at: new Date(),
        private: false,
        email: req.body.email,
        password: hash,
        token: uid2(32),
        favorites: [{type: mongoose.Schema.Types.ObjectId, ref: 'places'}],
        companions: [{name : String, dogBreed : String, weight : Number, sex : String, comment: String,}],
        contacts: [{type: mongoose.Schema.Types.ObjectId, ref: 'users'}],
        discussions: [{type: mongoose.Schema.Types.ObjectId, ref: 'discussions'}]
      })
      newUser.save().then(data => {
        res.json({result: true, user: data})
      })
    }
  })

})

module.exports = router;
