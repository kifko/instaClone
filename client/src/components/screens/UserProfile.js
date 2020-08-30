import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";
import { useParams } from "react-router-dom"; //hook

const Profile = () => {
  const [userProfile, setProfile] = useState(null);

  const { state, dispatch } = useContext(UserContext);
  const { userid } = useParams();
  const [showfollow, setShowFollow] = useState(
    state ? !state.following.includes(userid) : true
  ); //Pieza de la lógica para mostrar un botón u otro de follow/unfollow

  useEffect(() => {
    fetch(`/user/${userid}`, {
      //concatenamos el :id con las ``
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log(result);
        setProfile(result);
      });
  }, []);

  const followUser = () => {
    //Implementamos la lógica en el frontEnd
    fetch("/follow", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        followId: userid,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch({
          type: "UPDATE",
          payload: { following: data.following, followers: data.followers },
        });
        localStorage.setItem("user", JSON.stringify(data)); //Aqui hacemos el stringify para poder recoger todos los datos de "user"
        // setProfile({}) //Es un objeto con dos keys, userKey, y postKey. Parece ser que es mejor actualizar el estado con el sistema de la siguiente línea
        setProfile((prevState) => {
          //Esto lo hacemos para actualizar el estado!!
          return {
            ...prevState, //Spreading prevState
            user: {
              //Aquí sobreescribimos user con los nuevos datos, followings & followers
              ...prevState.user, //Spread
              followers: [...prevState.user.followers, data._id], //Sreed out (en vez de $push) y sobreescribimos followers accediendo a user desde prevState y desde ahí accedemos a followers, y finalmente append data._id
            },
          };
        });
        setShowFollow(false); //Ocultamos button follow al responderse exitósamente al .then
      });
  };
  const unfollowUser = () => {
    //Implementamos la lógica en el frontEnd
    fetch("/unfollow", {
      //Indicamos la ruta de user.js\routes, router.put('/follow')
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        unfollowId: userid, //unfollowId lo llamamos en user.js\routes router.put('/unfollow')
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        dispatch({
          type: "UPDATE",
          payload: { following: data.following, followers: data.followers },
        });
        localStorage.setItem("user", JSON.stringify(data)); //Aqui hacemos el stringify para poder recoger todos los datos de "user"
        // setProfile({}) //Es un objeto con dos keys, userKey, y postKey. Parece ser que es mejor actualizar el estado con el sistema de la siguiente línea
        setProfile((prevState) => {
          //Esto lo hacemos para actualizar el estado!!
          const newFollower = prevState.user.followers.filter(
            (item) => item !== data._id
          );
          return {
            ...prevState, //Spreading prevState
            user: {
              //Aquí sobreescribimos user con los nuevos datos, followings & followers
              ...prevState.user, //Spread
              followers: newFollower, //Sreed out (en vez de $push) y sobreescribimos followers accediendo a user desde prevState y desde ahí accedemos a followers, y finalmente append data._id
            },
          };
        });
        setShowFollow(true);
      });
  };
  return (
    //   fragmentos vacios y añadimos una expresión "{userProfile ?}" como condición para que se cargue el "loading...!"
    <>
      {userProfile ? (
        <div style={{ maxWidth: "550px", margin: "0px auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              margin: "18px 0px",
              borderBottom: "1px solid grey",
            }}
          >
            <div>
              <img
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "80px",
                }}
                src={userProfile.user.pic} //FOTOPERFIL
              />
            </div>
            <div>
              <h4>{userProfile.user.name}</h4>
              <h5>{userProfile.user.email}</h5>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  width: "108%",
                }}
              >
                {/* Se debe actualizar el estado para poder incrementar userProfile  */}
                <h6>{userProfile.posts.length} posts</h6>
                <h6>{userProfile.user.followers.length} followers</h6>
                <h6>{userProfile.user.following.length} following</h6>
              </div>
              {showfollow ? ( //Si showfollow es true, entonces, devuelve button follow
                <button
                  style={{
                    margin: "10px",
                  }}
                  className="btn waves-effect waves-light #64b5f6 blue darken-1"
                  onClick={() => followUser()}
                >
                  Follow
                </button>
              ) : (
                //Else, unfollow
                <button
                  style={{
                    margin: "10px",
                  }}
                  className="btn waves-effect waves-light #64b5f6 blue darken-1"
                  onClick={() => unfollowUser()}
                >
                  Unfollow
                </button>
              )}
            </div>
          </div>
          <div className="gallery">
            {userProfile.posts.map((item) => {
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
      ) : (
        <h2>loading...!</h2>
      )}
    </>
  );
};

export default Profile;
