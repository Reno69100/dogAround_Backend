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
            .populate('messages.user_id', 'pseudo avatar');

        //Remise à zéro nouveau message
        if ((allmessages.newMessage !== null)&&(allmessages.newMessage.toString() !== validUser._id.toString())) {
            const razmessage = await Discussion.findByIdAndUpdate(queryId,
                { $set: { "newMessage": null } },
                { new: true })
        }

        //Mise en forme donnée envoyées
        if (allmessages) {
            const messages = allmessages.messages.map(e => {
                const obj = {
                    pseudo: e.user_id.pseudo,
                    avatar: e.user_id.avatar,
                    date: e.date,
                    message: e.message,
                }
                return obj;
            })
            res.json({ result: true, messages: messages });
        }
        else {
            res.status(400).json({ result: false, error: "discussion non trouvée" });
        }
    }
    catch (error) {
        /* console.log(error) */
        res.status(400).json({ result: false, error: "discussion non trouvée" });
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
    try {
        const newmessage = await Discussion.findByIdAndUpdate(queryId,
            { $push: { "messages": message }, $set: { "newMessage": validUser.id } },
            { new: true })

        if (newmessage) {
            res.json({ result: true });
        }
        else {
            res.status(400).json({ result: false, error: "Message non émis" });
        }
    }
    catch (error) {
        /* console.log(error) */
        res.status(400).json({ result: false, error: "discussion non trouvée" });
    }
});


module.exports = router;