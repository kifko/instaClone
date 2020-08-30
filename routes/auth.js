const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const crypto = require("crypto"); //Para crear un token único
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const requireLogin = require("../middleware/requireLogin");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { SENDGRID_API, EMAIL } = require("../config/keys");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: SENDGRID_API,
    },
  })
);

router.post("/signup", (req, res) => {
  const {
    name,
    email,
    password,
    pic, //Recibimos del frontend                                                 //FOTOPERFIL
  } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({
      error: "please add all the fields",
    });
  }
  User.findOne({
    email: email,
  })
    .then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({
          error: "user allready exists with that email",
        });
      }
      bcrypt.hash(password, 10).then((hashedpassword) => {
        const user = new User({
          name,
          email,
          password: hashedpassword,
          pic, //pic en vez de pic:pic ya que lo importamos en la linea 17 desde el frontEnd   //FOTOPERFIL
        });
        user
          .save()
          .then((user) => {
            transporter.sendMail({
              // De aquí...
              //Dentro de sendEmail le pasamos un objeto "({})"
              to: user.email,
              from: "no-replay@clonix.com", //Cualquier email que queramos
              subject: "signup success",
              html: "<h1>Welcome to InstaClone</h1>",
            }); // A aquí podría comentarse
            res.json({
              message: "saved succsessfully",
            });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({
      error: "please add email or password",
    });
  }
  User.findOne({
    email: email,
  }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({
        error: "Invalid Email or Password",
      });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          //   res.json({ message: "successfully signed in" });
          const token = jwt.sign(
            {
              _id: savedUser._id,
            },
            JWT_SECRET
          );
          const {
            _id,
            name,
            email,
            followers, //recogemos la info de follower
            following, //recogemos la info de following
            pic, //mostramos pic                         //FOTOPERFIL
          } = savedUser;
          res.json({
            token,
            user: {
              _id,
              name,
              email,
              followers,
              following,
              pic, //FOTOPERFIL
            },
          });
        } else {
          return res.status(422).json({
            error: "Invalid Email or Password",
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.post("/reset-password", (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: "User dont exists with that email" });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 1800000; //30 minutos
      user.save().then((result) => {
        transporter.sendMail({
          to: user.email,
          from: "no-replay@clonix.com",
          subject: "password reset",
          html: `<p>You requested for password reset</p>
          <h5>click in this <a href="${EMAIL}/reset/${token}">link</a>to reset password</h5> 
          `, // Hemos cambiado esta url de localhost:3000 a ${EMAIL} when deploying to heroku
        });
        res.json({ message: "check your email" });
      });
    });
  });
});

router.post("/new-password", (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "Try again session expired" });
      }
      bcrypt.hash(newPassword, 10).then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((saveduser) => {
          res.json({ message: "passport succsessfully updated" });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
