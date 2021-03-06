// Aquí configuramos la página del perfil
import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";

const Profile = () => {
  const [mypics, setPics] = useState([]);
  const { state, dispatch } = useContext(UserContext);
  const [image, setImage] = useState("");
  // console.log(state);
  useEffect(() => {
    fetch("/mypost", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setPics(result.mypost);
      });
  }, []);
  useEffect(() => {
    if (image) {
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
          fetch("/updatepic", {
            method: "put",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
              pic: data.url,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              console.log(result);
              localStorage.setItem(
                "user",
                JSON.stringify({ ...state, pic: result.pic })
              ); //spread de state
              dispatch({ type: "UPDATEPIC", payload: result.pic });
              // window.location.reload(); //utilizamos esto para evitar el error undefined con UPDATEPIC
            });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [image]);
  const updatePhoto = (file) => {
    setImage(file);
  };
  return (
    <div style={{ maxWidth: "550px", margin: "0px auto" }}>
      <div
        style={{
          margin: "18px 0px", // 18px top & bottom, 0px left & right
          borderBottom: "1px solid grey",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          {/* Primer div para la imagen del perfil */}
          <div>
            <img
              style={{ width: "160px", height: "160px", borderRadius: "80px" }}
              src={state ? state.pic : "loading"} //if state is availeable, then I can use state.pic
            />
          </div>
          <div>
            {/* visualizamos el nombre de usuario */}
            <h4>{state ? state.name : "loading"}</h4>
            {/* visualizamos el email */}
            <h5>{state ? state.email : "loading"}</h5>
            <div // Le damos estilo para separar post - followers - followings
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "108%",
              }}
            >
              {/* Contador de posts */}
              <h6>{mypics.length} posts </h6>
              {/* contador de followers */}
              <h6>{state ? state.followers.length : "0"} followers</h6>
              {/* contador de followings */}
              <h6>{state ? state.following.length : "0"} following</h6>
            </div>
          </div>
        </div>
        <div className="file-field input-field" style={{ margin: "10px" }}>
          <div className="btn #64b5f6 blue darken-1">
            <span>Update pic</span>
            {/* Debajo, en setImage, al darle cntrl + click, nos muestra que esta conectado a la constante de la linea 10 */}
            <input
              type="file"
              onChange={(e) => updatePhoto(e.target.files[0])}
            />
          </div>
          <div className="file-path-wrapper">
            <input className="file-path validate" type="text" />
          </div>
        </div>
      </div>
      <div className="gallery">
        {mypics.map((item) => {
          return (
            <img
              key={item._id}
              className="item"
              src={item.photo}
              alt={item.title}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
