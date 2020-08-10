const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
const requireLogin = require("../middleware/requireLogin");

router.get("/allPosts", requireLogin, (req, res) => {
    Post.find()
        .populate("postedBy", "_id name pic")
        .populate("comments.postedBy", "_id name")
        .then(allPosts => {
            res.json({ allPosts })
        })
        .catch(err => {
            console.log(err);

        })
})
router.get("/getsubpost", requireLogin, (req, res) => {
    // for postedBy in following

    Post.find({ postedBy: { $in: req.user.following } })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .then(allPosts => {
            res.json({ allPosts })
        })
        .catch(err => {
            console.log(err);

        })
})



router.get("/myPost", requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .then(myPost => {
            res.json({ myPost })
        })
        .catch(err => {
            console.log(err);

        })
})


router.post("/createPost", requireLogin, (req, res) => {
    const { title, body, photo } = req.body;
    if (!title || !body || !photo) {
        return res.status(401).json({ error: "something is missing!" });
    }
    req.user.password = undefined;
    const post = new Post({
        title,
        body,
        photo,
        postedBy: req.user
    });
    post.save().then(result => {
        res.json({ post: result })
    })
        .catch(err => {
            console.log(err);

        })

})

router.put("/like", requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user._id }
    }, {
        new: true
    })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })

})
router.put("/unlike", requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user._id }
    }, {
        new: true
    })
        .populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })

})
router.put('/comments', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
        .populate("comments.postedBy", "_id name")
        .populate("postedBy", "_id name")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

router.delete("/deletepost/:postId", requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postId })
        .populate("postedBy", "_id")
        .exec((err, post) => {
            console.log(post);
            if (err || !post) {
                res.status(422).json({ error: err })
            }
            if (post.postedBy._id.toString() == req.user._id.toString()) {
                post.remove()
                    .then(result => {
                        res.json(result)
                    }).catch(err => {
                        console.log(err);
                    })
            }
        })
})

router.put("/updatepost", requireLogin, (req, res) => {
    Post.findOne({ postedBy: req.user._id })
        .populate("postedBy", "_id")
        .exec((err, post) => {
            // console.log(post);
            if (err || !post) {
                res.status(422).json({ error: err })
            }
            if (post.postedBy._id.toString() == req.user._id.toString()) {
                post.update({ $set: { photo: req.body.photo } })
                    .then(result => {
                        res.json(result)
                    }).catch(err => {
                        console.log(err);
                    })
            }
        })
})

module.exports = router