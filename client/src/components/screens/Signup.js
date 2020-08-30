import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import M from "materialize-css";

const Signup = () => {
  const history = useHistory();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState(undefined); //Al traer un pic undefined de Auth, router.post('/signup/), que es está definido en el modelo
  useEffect(() => {
    if (url) {
      uploadFields();
    }
  }, [url]); //Si la url cambia (Recoge los cambios en la línea 29)

  const uploadPic = () => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "InstaClone");
    data.append("cloud_name", "l4n14k");
    fetch("https://api.cloudinary.com/v1_1/l4n14k/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setUrl(data.url); //enviamos los cambios de la url a la línea 16
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const uploadFields = () => {
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
        name,
        password,
        email,
        pic: url, //Añadimos aquí para poder enviarlo
      }),
    })
      .then((res) => res.json())
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
      //La lógica: Si (image) existe, carga uploadPic, creado en la constante anterior, y lo llamamos con (). Pasamos a uploadFields la lógica que teníamos hasta ahora aquí
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
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <h5>
          <Link to="/signin">Allready a member ?</Link>
        </h5>
      </div>
    </div>
  );
};

export default Signup;
