// Ventana con el contenido de /createpost
import React, { useState, useEffect } from "react";
import M from "materialize-css";
import { useHistory } from "react-router-dom";
import App from "../../App";
import NavBar from "../Navbar";

const CreatePost = () => {
  const history = useHistory();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (url) {
      fetch("/createpost", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          title,
          body,
          pic: url,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            M.toast({ html: data.error, classes: "#c62828 red lighten-1" });
          } else {
            M.toast({
              html: "Post created succsessfully",
              classes: "#43a047 green darken-1",
            });
            history.push("/");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [url]);

  const postDetails = () => {
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
        setUrl(data.url);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className="card input-field"
      style={{
        margin: "30px auto", // Margen entre la tarjeta y el header
        maxWidth: "500px", // Máxima anchura
        padding: "20px", // Separación entre lineas
        textAlign: "center", // Texto alineado al centro
      }}
    >
      <input
        type="text"
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {/* Importamos de materializecss text-imput.html */}
      <div className="file-field input-field">
        <div className="btn #64b5f6 blue darken-1">
          {/* Este spam nos permite seleccionar una imagen de nuestro dispositivo */}
          <span>Upload Image</span>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>
        <div className="file-path-wrapper">
          <input className="file-path validate" type="text" />
        </div>
      </div>
      <button
        className="btn waves-effect waves-light #64b5f6 blue darken-1"
        onClick={() => postDetails()}
      >
        Submit post
      </button>
    </div>
  );
};

// Para incluirlo después en la ruta de App.js y en el link de NavBar
export default CreatePost;
