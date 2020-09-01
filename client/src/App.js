import React, { useEffect, createContext, useReducer, useContext } from "react";
import NavBar from "./components/Navbar";
import "./App.css";
import { BrowserRouter, Route, Switch, useHistory } from "react-router-dom";
import Home from "./components/screens/Home"; // Importamos todas las Screens
import Signup from "./components/screens/Signup";
import Signin from "./components/screens/Signin";
import Profile from "./components/screens/Profile";
import CreatePost from "./components/screens/CreatePost";
import { reducer, initialState } from "./reducers/userReducer";
import UserProfile from "./components/screens/UserProfile";
import SubscribesUserPosts from "./components/screens/SubscribedUserPosts";
import Reset from "./components/screens/Reset";
import NewPassword from "./components/screens/Newpassword";

export const UserContext = createContext();

const Routing = () => {
  const history = useHistory();
  const { state, dispatch } = useContext(UserContext);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "USER", payload: user });
    } else {
      if (!history.location.pathname.startsWith("/reset"))
        history.push("/signin");
    }
  }, []);
  return (
    <Switch>
      {/* Indicamos "exact path" para que la ruta "home"
       no aparezca en todas las rutas que comiencen por "/" (básicamente en todas..) */}
      <Route exact path="/">
        <Home />
      </Route>
      {/* Todas estas rutas son llamadas por los likns en Navbar */}
      <Route path="/signup">
        <Signup />
      </Route>
      <Route path="/signin">
        <Signin />
      </Route>
      {/* Aquí indicamos "exact" para que no sea heredado por "UserProfile" */}
      <Route exact path="/profile">
        <Profile />
      </Route>
      <Route path="/create">
        <CreatePost />
      </Route>
      <Route path="/profile/:userid">
        <UserProfile />
      </Route>
      {/* añadimos la ruta /myfollowers a Navbar */}
      <Route path="/myfollowingpost">
        <SubscribesUserPosts />
      </Route>
      <Route exact path="/reset">
        <Reset />
      </Route>
      <Route path="/reset/:token">
        <NewPassword />
      </Route>
    </Switch>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <NavBar />
        <Routing />
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
