const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require('../middleware/requireLogin')
const Post = mongoose.model("Post")


router.get('/allpost', requireLogin, (req, res) => {
    Post.find()
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .sort('-createdAt') //para mostrar los posts de más recientes a más antiguos
        .then(posts => {
            res.json({
                posts
            })
        })
        .catch(err => {
            console.log(err)
        })
})
router.get('/getsubpost', requireLogin, (req, res) => {
    // inetntando algo así: if postedBy (spreading) in following, return POST
    Post.find({
            postedBy: {
                $in: req.user.following
            }
        }) //$in para buscar en un array (el de following en este caso)
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name")
        .sort('-createdAt')
        .then(posts => {
            res.json({
                posts
            })
        })
        .catch(err => {
            console.log(err)
        })
})

router.post('/createpost', requireLogin, (req, res) => {
    const {
        title,
        body,
        pic
    } = req.body
    if (!title || !body || !pic) {
        res.status(402).json({
            error: "Please add all the fields"
        })
    }
    req.user.password = undefined
    const post = new Post({
        title,
        body,
        photo: pic,
        postedBy: req.user
    })
    post.save().then(result => {
            res.json({
                post: result
            })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/mypost', requireLogin, (req, res) => {
    Post.find({
            postedBy: req.user._id
        })
        .populate("PostedBy", "_id name")
        .then(mypost => {
            res.json({
                mypost
            })
        })
        .catch(err => {
            console.log(err)
        })
})

router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: {
            likes: req.user._id
        }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({
                error: err
            })
        } else {
            res.json(result)
        }
    })
})

router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: {
            likes: req.user._id
        }
    }, {
        new: true
    }).exec((err, result) => {
        if (err) {
            return res.status(422).json({
                error: err
            })
        } else {
            res.json(result)
        }
    })
})

router.put('/comment', requireLogin, (req, res) => { //Con requireLogin verificamos al usuario por su token desde el middleware
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
            $push: {
                comments: comment
            }
        }, {
            new: true
        })
        .populate("postedBy", "_id name")
        .populate("comments.postedBy", "_id name") //Populate para desplegar la info (nombre,edad..) de user._id solicitada en postedBy
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({
                    error: err
                })
            } else {
                res.json(result)
            }
        })
})
router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne({
            _id: req.params.postId
        })
        .populate("postedBy", "_id")
        .exec((err, post) => {
            if (err || !post) {
                return res.status(422).json({
                    error: err
                })
            }
            if (post.postedBy._id.toString() === req.user._id.toString()) {
                post.remove()
                    .then(result => {
                        res.json(result)
                    }).catch(err => {
                        console.log(err)
                    })
            }
        })
})

module.exports = router