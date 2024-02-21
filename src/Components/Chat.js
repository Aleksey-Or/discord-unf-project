import React, { useState } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import Servers from "./Server";
import ServerRooms from "./ServerRooms";
import Friends from "./Friends";
import FriendChat from "./FriendChat";
import ServerChat from "./ServerChat";

const ChatWindow = () => {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [selectedServer, setSelectedServer] = useState(null);

  const handleServerClick = (serverId) => {
    setSelectedServer(serverId);
  };

  const handleHomeClick = () => {
    setSelectedServer(null);
  };

  return (
    <div className="chatWindow">
      <h1 className="getStartedText">
        Welcome to the Discord {user.displayName}
      </h1>
      <button className="getStarted" onClick={() => signOut(auth)}>
        Sign Out
      </button>
      <div className="discordsfc">
        <div className="serverList">
          <Servers handleServerClick={handleServerClick} />
        </div>
        <div className="v-line"></div>
        <div className="friendsList">
          <Friends />
        </div>
        <div className="chat">
          {selectedServer ? (
            <ServerChat
              serverId={selectedServer}
              handleHomeClick={handleHomeClick}
            />
          ) : (
            <FriendChat />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
