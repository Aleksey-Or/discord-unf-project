import React from "react";
import "./style.css";
import {
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { provider } from "../firebase.js";
import { useNavigate } from "react-router-dom";

import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { createOrUpdateUserProfile } from "../firebase.js";
import { Link } from "react-router-dom";
import Servers from "./Server";

import logo from "../logo.png";

const GetStarted = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);

  const googlePopUp = async () => {
    setPersistence(auth, browserLocalPersistence).then(() => {
      signInWithPopup(auth, provider)
        .then((result) => {
          const user = auth.currentUser;
          if (user) {
           
            createOrUpdateUserProfile(
              user.uid,
              user.displayName,
              user.email,
              user.photoURL
            );
          }
          navigate("/discord"); 
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  if (loading) {

    return (
      <div className="vertical">

          <img className="logo" src={logo} alt="logo" />
    <div className="getStartedContainer">
      
      <h1 className="getStartedText">Loading...</h1>
      </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="vertical">

          <img className="logo" src={logo} alt="logo" />
      <div className="getStartedContainer">
        
        <h1 className="getStartedText">Welcome {user.displayName}</h1>
        <Link className="getStartedText" to="/discord">
          Discord
        </Link>
        </div>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="vertical">

          <img className="logo" src={logo} alt="logo" />
        
        <div className="getStartedContainer">
          <p className="getStartedText">
            Start a conversation with your friends right now!
          </p>
          <button className="getStarted" onClick={googlePopUp}>
            Get Started
          </button>
        </div>
      </div>
      
    );
  }
};

export default GetStarted;
