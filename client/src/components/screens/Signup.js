import React, { useState, useEffect } from "react"; // useState Hook, since React 16.8
import { Link, useHistory } from "react-router-dom"; // Importamos Link para poder usarlo en la redirección entre signin y signup
import M from "materialize-css";

const Signup = () => {
  const history = useHistory();
  const [name, setName] = useState(""); // Hook con valor inicial vacío
  const [password, setPassword] = useState(""); // Hook con valor inicial vacío
  const [email, setEmail] = useState(""); // Hook con valor inicial vacío
  const [image, setImage] = useState(""); // Hook con valor inicial vacío
  const [url, setUrl] = useState(undefined); // Hook con valor inicial undefined
  useEffect(() => {
    if (url) {
      uploadFields();
    }
  }, [url]); //Si la url cambia (Recoge los cambios en la línea 29)

  const uploadPic = () => {
    // Creamos esta constante para subir las fotos a CLOUDINARY
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "InstaClone");
    data.append("cloud_name", "l4n14k");
    fetch("https://api.cloudinary.com/v1_1/l4n14k/image/upload", {
      // Enlazamos la ruta http con fetch
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setUrl(data.url); // Enviamos los cambios de la url al objeto de la línea 16
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const uploadFields = () => {
    // Aquí comprobamos que el mail sea correcto gracias a EMAILREGX
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      )
    ) {
      M.toast({ html: "invalid email", classes: "#c62828 red lighten-1" });
      return;
    }
    fetch("/signup", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Antes que nada debemos convertir el objeto js a una string JSON para enviar aquello que queramos
        name,
        password,
        email,
        pic: url, // Añadimos aquí para poder enviarlo
      }),
    })
      .then((res) => res.json()) // Convertimos la respuesta a json
      .then((data) => {
        if (data.error) {
          M.toast({ html: data.error, classes: "#c62828 red lighten-1" });
        } else {
          M.toast({ html: data.message, classes: "#43a047 green darken-1" });
          history.push("/signin");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const PostData = () => {
    if (image) {
      //La lógica: Si (image) existe, carga uploadPic, linea 18, y lo llamamos con (). Pasamos a uploadFields, linea 35 la lógica que teníamos hasta ahora aquí
      uploadPic();
    } else {
      uploadFields(); //pasamos  por aquí toda la lógica. Si está vacío, entonces devuelve uploadFields
    }
  };

  return (
    <div className="mycard">
      <div className="card auth-card input-field">
        <h2>InstaClone</h2>
        <input
          type="text"
          placeholder="name"
          value={name} // Hook nmame, sincronizamos el input al header
          onChange={(e) => setName(e.target.value)} // Hook event que recibe el cambio substitullendo name
        />
        <input
          type="text"
          placeholder="email"
          value={email} // Hook email, sincronizamos el input al header
          onChange={(e) => setEmail(e.target.value)} // Hook event que recibe el cambio substitullendo email
        />
        <input
          type="password"
          placeholder="password"
          value={password} // Hook password, sincronizamos el input al header
          onChange={(e) => setPassword(e.target.value)} // Hook event que recibe el cambio substitullendo password
        />
        {/* Todos estos div's (hasta llegar a button) los hemos copiado de CreatePost\screens */}
        <div className="file-field input-field">
          <div className="btn #64b5f6 blue darken-1">
            <span>Upload pic</span>
            {/* Debajo, en setImage, al darle cntrl + click, nos muestra que esta conectado a la constante de la linea 10 */}
            <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          </div>
          <div className="file-path-wrapper">
            <input className="file-path validate" type="text" />
          </div>
        </div>
        <button
          className="btn waves-effect waves-light #64b5f6 blue darken-1"
          onClick={() => PostData()}
        >
          Signup
        </button>
        {/* Añadimos el h5 para redireccionar a /signin en caso de que ya sea usuario */}
        <h5>
          <Link to="/signin">Allready a member ?</Link>
        </h5>
      </div>
    </div>
  );
};

export default Signup;
