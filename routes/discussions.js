var express = require("express");
var router = express.Router();
const User = require("../models/users");
const Discussion = require('../models/discussions')

//route get /discussions/messages => récupération de tous les messages de la dicussion sélectionné
router.get("/messages/:token", async (req, res) => {
    //Vérification id non vide
    const queryId = req.query.id || "";
    if (!queryId) {
        return res.json({ result: false, error: "discussion non trouvée" });
    }

    //Vérification utilsateur connecté
    const validUser = await User.findOne({ token: req.params.token })
    if (!validUser) {
        return res.json({ result: false, error: "utilisateur non trouvé" });
    }

    //Récupération de la dicussions
    try {
        const allmessages = await Discussion.findById(queryId)
        .populate('messages.user_id','pseudo');

        if (allmessages) {
            const messages = allmessages.messages.map(e=> {
                const obj = {
                    pseudo: e.user_id.pseudo,
                    date:e.date,
                    message:e.message,
                }
                return obj;
            })
            res.json({ result: true, messages: messages });
        }
        else {
            res.json({ result: false, error: "discussion non trouvée" });
        }
    }
    catch {
        res.json({ result: false, error: "discussion non trouvée" });
    }
});

//route put /discussions/messages => ajout nouveau message
router.put("/messages/:token", async (req, res) => {
    //Vérification utilsateur connecté
    const validUser = await User.findOne({ token: req.params.token })
    if (!validUser) {
        return res.json({ result: false, error: "utilisateur non trouvé" });
    }

    //Vérification id non vide
    const queryId = req.query.id || "";
    if (!queryId) {
        return res.json({ result: false, error: "discussion non trouvée" });
    }

    //Définitions
    const message = {
        user_id: validUser.id,
        date: new Date(),
        message: req.body.message
    };

    //Création nouveau message
    /* console.log(queryId) */
    Discussion.findByIdAndUpdate(
        queryId,
        { $push: { messages: message } },
        { new: true },)
        .then((data) => {
            /* console.log(data) */
            if (data) {
                res.json({ result: true });
            }
            else {
                res.json({ result: false, error: "discussion non trouvée" });
            }
        })
        .error(() => res.json({ result: false, error: "discussion non trouvée" }))

});


module.exports = router;