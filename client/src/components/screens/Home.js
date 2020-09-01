// Home es la primera screen de components para importarlas después en App.js
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../App";
import { Link } from "react-router-dom";

const Home = () => {
  const [data, setData] = useState([]);
  // const [items, setItems] = useState([]);
  const { state, dispatch } = useContext(UserContext);
  useEffect(() => {
    fetch("/allpost", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setData(result.posts);
      });
  }, []);

  const likePost = (id) => {
    fetch("/like", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log(result);
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const unlikePost = (id) => {
    fetch("/unlike", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log(result);
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        setData(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const makeComment = (text, postId) => {
    fetch("/comment", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"), //Autorización a postear via jwt
      },
      body: JSON.stringify({
        //Objeto dentro del body "stringificado"
        postId, //Simplificado a, postId, en vez de postId:postId,
        text, //Simplificado a, text, en vez de text:text
      }),
    })
      .then((res) => res.json()) //respondemos al input del form con una promesa
      .then((result) => {
        //finalmente respondemos
        console.log(result);
        const newData = data.map((item) => {
          if (item._id == result._id) {
            return result;
          } else {
            return item;
          }
        });
        setData(newData); //Actualizamos el objeto setData (const Home [data, setData])
      })
      .catch((err) => {
        //Recogemos errores
        console.log(err); //consoleamos errores
      });
  };

  const deletePost = (postid) => {
    //Añadimos la lógica
    fetch(`/deletepost/${postid}`, {
      method: "delete",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        const newData = data.filter((item) => {
          return item._id !== result._id;
        });
        setData(newData);
      });
  };
  return (
    <div className="home">
      {data.map((item) => {
        // console.log(item);
        return (
          <div className="card home-card" key={item._id}>
            <h5 style={{ padding: "6px" }}>
              <Link
                to={
                  item.postedBy._id !== state._id
                    ? "/profile/" + item.postedBy._id
                    : "/profile"
                }
              >
                {item.postedBy.name}
              </Link>

              {item.postedBy._id == state._id && (
                <i // Este i tag nos sirve para mostrar el icono que nos permitirá borrar nuestro post
                  className="material-icons"
                  style={{
                    float: "right",
                  }}
                  onClick={() => deletePost(item._id)}
                >
                  delete
                </i>
              )}
            </h5>
            <div className="card-image">
              Aquí mostraremos las imágenes de todos los posts
              <img src={item.photo} />
            </div>
            <div className="card-content">
              <i className="material-icons" style={{ color: "red" }}>
                favorite
              </i>
              {item.likes.includes(state._id) ? (
                <i
                  className="material-icons"
                  onClick={() => {
                    unlikePost(item._id);
                  }}
                >
                  thumb_down
                </i>
              ) : (
                <i
                  className="material-icons"
                  onClick={() => {
                    likePost(item._id);
                  }}
                >
                  thumb_up
                </i>
              )}

              {/* En este h6 se muestra el número de likes */}
              <h6>{item.likes.length} likes</h6>
              {/* En este h6 se muestra el título del post */}
              <h6>{item.title}</h6>
              {/* En este parrafo se muestra el body del post */}
              <p>{item.body}</p>
              {/* Para almacenar comentarios */}
              {item.comments.map((record) => {
                return (
                  <h6 //este h6 se encarga de dar estilo e info relevante al comentario
                    key={record._id}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {record.postedBy.name}
                    </span>
                    {record.text}
                  </h6>
                );
              })}
              <form //form para introducir commentario en fotos
                onSubmit={(e) => {
                  e.preventDefault();
                  makeComment(e.target[0].value, item._id); //makeComment accede al contenido del nuevo evento y lo envia a const makeComment
                }}
              >
                <input type="text" placeholder="add a comment" />
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Home;
