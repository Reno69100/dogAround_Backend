var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Discussion = require('../models/discussions')

//route get /discussions/messages => récupération de tous les messages de la dicussion sélectionné
router.get("/messages/:token", (req, res) => {
    //Vérification utilsateur connecté
    const queryId = req.query.id || "";
    if (queryId) {
        try {
            User.findOne({ token: req.params.token })
                .then((data) => {
                    //Recherche de l'id de la discussion
                    if (data) {
                        //Récupération de la dicussions
                        Discussion.findById(queryId)
                        /* .populate({path:'user_id',select:'pseudo'}) */
                            .then((messages) => {
                                if (messages) {
                                    res.json({ result: true, messages });
                                }
                                else {
                                    res.json({ result: false, error: "discussion non trouvée" });
                                }
                            })
                    }
                    //Token utilisateur non trouvé
                    else {
                        res.json({ result: false, error: "utilsateur non trouvée" });
                    }
                });
        }
        catch {
            res.json({ result: false, error: "discussion non trouvée" });
        }
    }
    //Pas de discussions commencées
    else {
        res.json({ result: false, error: "discussion non trouvée" });
    }
});

//route put /discussions/messages => ajout nouveau message
router.put("/messages/:token", (req, res) => {
    //Vérification utilsateur connecté
    User.findOne({ token: req.params.token })
        .then((data) => {
            //Recherche de l'id de la discussion
            if (data) {
                const queryId = req.query.id || "";
                const message = {
                    user_id: data.id,
                    date: new Date(),
                    message: req.body.message
                };

                //Recherche de l'id et mise à jour de la discussion
                if (queryId) {
                    console.log(queryId)
                    Discussion.findByIdAndUpdate(
                        queryId,
                        { $push: { messages: message } },
                        { new: true },)
                        .then((data) => {
                            console.log(data)
                            if (data) {
                                res.json({ result: true });
                            }
                            else {
                                res.json({ result: false, error: "discussion non trouvée" });
                            }
                        })
                }
                //Création nouvelle discussion
                else {
                    const newDiscussion = new Discussion({
                        messages: {
                            user_id: data.id,
                            date: new Date(),
                            message: req.body.message
                        }
                    });
                    console.log(newDiscussion)
                    newDiscussion
                        .save()
                        .then((data) => {
                            if (data) {
                                res.json({ result: true });
                            }
                            else {
                                res.json({ result: false, error: "probleme sauvegarde discussion" });
                            }
                        })
                }
            }
            //Token utilisateur non trouvé
            else {
                res.json({ result: false, error: "utilisateur non trouvé" });
            }
        });
});


module.exports = router;