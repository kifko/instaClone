const express = require("express");
const router = express.Router(); // Requerimos router de express
const mongoose = require("mongoose");
const User = mongoose.model("User"); // Recurrimos a mongoose para importar userSchema
const crypto = require("crypto"); // Para crear un token único
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const requireLogin = require("../middleware/requireLogin"); // Importamos la lógica del middleware para verificar el token
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
  // Ruta donde solicitamos los datos del signup, disparando req, res =>
  const {
    name,
    email,
    password,
    pic, //Recibimos del frontend                                                 //FOTOPERFIL
  } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({
      //return detiene el flujo si se cumple
      error: "please add all the fields",
    });
  }
  User.findOne({
    //Este es el primer User que importamos via mongoose.
    email: email, //1_Dentro de User, busca en la base de datos;
  })
    .then((savedUser) => {
      //2_Guarda el mail en la base de datos
      if (savedUser) {
        //3_Si el email introducido coincide con algúno de los emails guardados,
        return res.status(422).json({
          //Le pasamos estado 422 indicando Unprocessable Entity (por defecto estado 200). Y return, para forzar Stop
          error: "the email is allready in use",
        });
      }
      bcrypt.hash(password, 10).then((hashedpassword) => {
        //Si la password es hasheada, then, hashedpassword password será la nueva construcción
        const user = new User({
          //metemos dentro de hashedpassword toda la variable constante const user
          name,
          email,
          password: hashedpassword,
          pic, //pic en vez de pic:pic ya que lo importamos en la linea 17 desde el frontEnd   //FOTOPERFIL
        });
        user
          .save() //guardamos al nuevo usuario
          .then((user) => {
            transporter.sendMail({
              // De aquí...
              //Dentro de sendEmail le pasamos un objeto "({})"
              to: user.email,
              from: "no-replay@clonix.com", //Cualquier email que queramos.. pero justo este parece que no va
              subject: "signup success",
              html: "<h1>Welcome to InstaClone</h1>",
              html: "<h2>The subject of this email is just to inform</h2>",
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
    //1_Dentro de User, busca en la base de datos;
    email: email, //2_si el email introducido coincide con algúno de los emails guardados;
  }).then((savedUser) => {
    //3_Se guarda el email.
    if (!savedUser) {
      //4_Si no se encuentra el mail.
      return res.status(422).json({
        //5_Se enviará res.status(422) Unprocessable Entity error
        error: "Invalid Email or Password", //Lo mismo que en la línea 122 por no facilitar posible ataque
      });
    }
    bcrypt
      .compare(password, savedUser.password) //comparamos la password con la guardada en DB
      .then((doMatch) => {
        //Boolean
        if (doMatch) {
          //   res.json({ message: "successfully signed in" });
          const token = jwt.sign(
            {
              _id: savedUser._id, // Asignamos savedUser._id al _id del payload en requireLogin
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
            token, //La key y el valor son el mismo (token:token), entonces reducimos
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
          //Si no se cumple el if, devuelve error
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
