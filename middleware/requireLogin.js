const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const mongoose = require("mongoose"); //Para recurrir a userModel
const User = mongoose.model("User");

module.exports = (req, res, next) => {
  const { authorization } = req.headers; // Requerimos autorización de headers
  if (!authorization) {
    // Si la autorización no está presente
    return res.status(401).json({
      // .json en vez de .send para convertir a JSON non objects (ex. null, undefined.. etc). .json además formateará con los settings que hallamos definido.
      error: "You must be logged in", // Return para parar el carro
    });
  } // Si la autorización está presente, recuperamos el token
  const token = authorization.replace("Bearer ", ""); // authorization es un string. La string viene con un "Bearer " y la reemplazamos por una string vacia "". La almacenamos en la const token
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    // Requerimos jwt, para verificar que el token es el mismo almacenado en la DB, con la secret Key "JWT_SECRET". Callback de err y payload
    if (err) {
      // Si el token no coincide saltará error
      return res.status(401).json({
        // Return para parar el carro
        error: "You must be logged in",
      });
    }
    const { _id } = payload;
    User.findById(_id).then((userdata) => {
      // Importamos con mongoose el User, y si hay coincidencia con la payload de const {_id}
      req.user = userdata; //Si el id coincide, lo guardamos en el userdata particular. La info estará disponible en req.user (email, name..)
      next(); //Para salir de este middleware, o pasar al siguiente.
    });
  });
};
