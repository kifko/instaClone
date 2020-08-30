const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    // required: [true, "Name is required"],
  },
  // surname: {
  //     type: String,
  //     required: false,
  // },
  email: {
    type: String,
    required: true,
    // unique: true,
  },
  // age: {
  //     type: Number,
  //     required: true,
  // },
  // gender: {
  //     type: String,
  //     required: true,
  // },
  // single: {
  //     type: Boolean,
  //     required: false,
  // },
  // country: {
  //     type: String,
  //     required: true,
  // },
  // city: {
  //     type: String,
  //     required: true,
  // },
  // postal_code: {
  //     type: Number,
  //     required: false,
  // },
  password: {
    type: String,
    // unique: true,
    required: true,
    // minlength: 8, //No se aún xq me permite passwords de menos de 8 caráctres. Probablemente por los jwevstocatelos
  },
  resetToken: String,
  expireToken: Date,
  pic: {
    //Añadimos la lógica de la foto por defecto en el perfil
    type: String,
    default:
      "https://res.cloudinary.com/l4n14k/image/upload/v1598569696/blank-profile-picture-973460_640_jeoimo.png",
  },
  followers: [
    {
      type: ObjectId,
      ref: "User",
    },
  ], //Creamos array de followers. La referencia es el UserModel exportado abajo via mongoose.model
  following: [
    {
      type: ObjectId,
      ref: "User",
    },
  ], //Creamos array de following (inicialmente vacío). De aquí nos vamos a crear la ruta.
  // role: {
  //     type: String,
  //     default: "user",
  //     enum: ["admin", "user"],
  // },
  // tokens: {
  //     type: String,
  // },
});
mongoose.model("User", userSchema);
