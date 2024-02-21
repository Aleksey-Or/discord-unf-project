import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";

import logo from "../logo.png";

const Header = () => {

  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);

  if (!user) {
    return <img src={logo} alt="logo" />;
  }
  if(loading){
    return
  }
  if(user){
    return
  }
;}

export default Header;
