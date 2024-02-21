import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import Friends from "./Friends";
import ServerChat from "./ServerChat";
import ServerRooms from "./ServerRooms";
import Server from "./Server";


const Discord = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [selectedServer, setSelectedServer] = useState(null);
  const [activeTab, setActiveTab] = useState("friends");

  const handleServerClick = (serverId) => {
    setSelectedServer(serverId);
    setActiveTab("server");
  };

  const handleHomeClick = () => {
    setSelectedServer(null);
    setActiveTab("friends");
  };

  if (!user) {
   
    navigate("/");
    return null;
  }

  return (
    <div className="discord">
      
        <Server onServerClick={handleServerClick} />
      
    </div>
  );
};

export default Discord;
