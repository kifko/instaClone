const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin") // Importamos requireLogin para proteger las rutas. Estaba pálido por las comillas simples..
const Post = mongoose.model("Post")


router.get('/allpost', requireLogin, (req, res) => { // Para mostrar los posts, con el callback req,res
    Post.find() // Hacemos uso de postModel para buscar todos los posts
        .populate("postedBy", "_id name") // Populate para expandir el id, y mostrar aquello que necesitemos de postedBy. _id y name en este caso
        .populate("comments.postedBy", "_id name")
        .sort('-createdAt') // Para mostrar los posts más recientes primero
        .then(posts => { // Si recibimos todos los posts, 
            res.json({
                posts
            })
        })
        .catch(err => { // Recogeremos si hubiera algún error
            console.log(err)
        })
})
router.get('/getsubpost', requireLogin, (req, res) => {
    Post.find({
            postedBy: {
                $in: req.user.following //$in buscará "user" en el array de following, requerido para el postedBy
            }
        })
        .populate("postedBy", "_id name") // incluímos (poblamos) el _id y el nombre a postedBy
        .populate("comments.postedBy", "_id name") // incluímos (poblamos) en el comentario de postedBy, el _id y el nombre
        .sort('-createdAt') // Para mostrar los posts más recientes primero
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
    } = req.body // Requerimos del body los datos en esta constante
    if (!title || !body || !pic) { // Si faltara alguno de los datos, enviamos el error
        res.status(402).json({
            error: "Please add all the fields"
        })
    }
    req.user.password = undefined // Requerimos la password disponible en req.user y la ocultamos via undefined
    const post = new Post({ // Requerimos Post de postModel de mongoose postSchema
        title,
        body,
        photo: pic,
        postedBy: req.user
    })
    post.save().then(result => { // Si todo ha ido bien, guardamos el post y enviamos resultado 
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