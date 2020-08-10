const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const brcypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/key");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post");

router.get("/user/:userid", requireLogin, (req, res) => {
    User.findOne({ _id: req.params.userid })
        .select("-password")
        .then(user => {
            Post.find({ postedBy: req.params.userid })
                .populate("postedBy", "_id name")
                .exec((err, posts) => {
                    if (err) {
                        return res.status(422).json({ error: err })
                    }
                    res.json({ user, posts })
                })
        }).catch(err => {
            console.log(err);
        })
})

router.put("/follow", requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.followId, {
        $push: { followers: req.user._id }
    }, {
        new: true
    }, ((err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        }
        User.findByIdAndUpdate(req.user._id, {
            $push: { following: req.body.followId }
        }, {
            new: true
        }).select("-password")
            .then(result => {
                res.json(result)
            }).catch(err => {
                console.log(err);
            })
    }))
})

router.put("/unfollow", requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, {
        $pull: { followers: req.user._id }
    }, {
        new: true
    }, ((err, result) => {
        if (err) {
            return res.status(422).json({ error: err })
        }
        User.findByIdAndUpdate(req.user._id, {
            $pull: { following: req.body.unfollowId }
        }, {
            new: true
        }).select("-password")
            .then(result => {
                res.json(result)
            }).catch(err => {
                console.log(err);
            })
    }))
})


router.put("/updatepic", requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $set: { pic: req.body.pic } }, { new: true },
        ((err, result) => {
            if (err) {
                return res.status(422).json({ error: "Profile cant be updated" })
            }
            res.json(result)
        })

    )
})
router.put("/updatename", requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $set: { name: req.body.name } }, { new: true },
        ((err, result) => {
            if (err) {
                return res.status(422).json({ error: "name cant be updated" })
            }
            res.json(result)
        })

    )
})
router.put("/updatemail", requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, { $set: { email: req.body.email } }, { new: true },
        ((err, result) => {
            if (err) {
                return res.status(422).json({ error: "name cant be updated" })
            }
            res.json(result)
        })

    )
})

module.exports = router;