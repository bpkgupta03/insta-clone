const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const brcypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/key");
const requireLogin = require("../middleware/requireLogin");

router.get("/protected", requireLogin, (req, res) => {
    res.send("hello user");
});

router.post("/signup", (req, res) => {
    const { name, email, password, pic } = req.body;
    if (!email || !password || !name) {
        res.status(422).json({ error: "plz add all the fields" });
    }

    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.json({ message: "This data already exists w.r.t. that email" });
            }
            brcypt.hash(password, 12)
                .then((hashedPassword) => {

                    const user = new User({
                        name,
                        email,
                        password: hashedPassword,
                        pic
                    })
                    user.save()
                        .then(user => {
                            res.json({ message: "Saved Successfully" });
                        })
                        .catch((err) => {
                            console.log(err);

                        })
                })
        })
        .catch((err) => {
            console.log(err);

        });


});

router.post("/signin", (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email: email })
        .then(savedUser => {
            if (!savedUser) {
                return res.status(422).json({ error: "Email or Password not exists! " });
            }
            brcypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        const token = jwt.sign({ _id: savedUser.id }, JWT_SECRET)
                        const { _id, name, email, followers, following, pic } = savedUser
                        res.json({ token, user: { _id, name, email, followers, following, pic } });
                        //res.json({ message: "Successfully signed In !" })
                    }
                    else {
                        return res.status(422).json({ error: "Invalid Email or password" })
                    }
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);

        });
});
module.exports = router;