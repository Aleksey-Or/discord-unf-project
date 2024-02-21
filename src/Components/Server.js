import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import ServerIcon from "./ServerIcon";
import { getAuth, signOut } from "firebase/auth";
import ServerChat from "./ServerChat";
import ServerRooms from "./ServerRooms";
import Friends from "./Friends";
import "./style.css";
const Servers = () => {
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [serverName, setServerName] = useState("");
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [servers, setServers] = useState([]);
  const [selectedServer, setSelectedServer] = useState(null);

  const colors = ["#FF6B6B", "#FF9F1C", "#FFC93C", "#4B7BEC", "#5EDC81"];

  const generateRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const serversQuery = query(
          collection(db, "servers"),
          where("members", "array-contains", user.uid)
        );
        const serversSnapshot = await getDocs(serversQuery);
        const serverData = serversSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServers(serverData);
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };

    fetchServers();
  }, [user]);

  const toggleCreateServer = () => {
    setShowCreateServer(!showCreateServer);
    setServerName("");
  };

  const handleCreateServer = async () => {
    try {
      const serverData = {
        name: serverName,
        members: [user.uid],
        color: generateRandomColor(),
      };

      const serversCollectionRef = collection(db, "servers");
      const docRef = await addDoc(serversCollectionRef, serverData);

      console.log("Server created successfully! Server ID:", docRef.id);

      setServerName("");
      toggleCreateServer();
    } catch (error) {
      console.error("Error creating server:", error);
    }
  };

  const handleServerClick = (serverId) => {
    console.log("Server ID:", serverId);
    setSelectedServer(serverId);
  };

  const handleHomeClick = () => {
    setSelectedServer(null);
  };

  const handleLogOut = () => {
    signOut(auth);
  };

  return (
    <div className="container">
      <div className="servers-section">
        <div className="user-profile">
          <img className="photo" src={user.photoURL} alt={user.displayName} />
          <p>{user.displayName} <br /> {user.uid}</p>
          
          
        </div>
        <h2 className="servers-title">Your Servers</h2>
        <button className="button" onClick={handleLogOut}>
          Log Out
        </button>
        <button className="button" onClick={handleHomeClick}>
          Home
        </button>
        <div className="server-icons">
          {servers.map((server) => (
            <div
              key={server.id}
              className="server-label"
              onClick={() => handleServerClick(server.id)}
            >
              <ServerIcon server={server} />
              
              <p className="server-name">{server.name}</p>
            </div>
          ))}
        </div>
        <div className="create-server-popup">
        {showCreateServer ? (
          <div className="popup-content">
            <input
            className="create-server-input"
              type="text"
              placeholder="Server name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
            />
            <br />
            <button className="button" onClick={handleCreateServer}>Create Server</button>
            <button className="button"onClick={toggleCreateServer}>Cancel</button>
          </div>
        ) : (
          <button className="button" onClick={toggleCreateServer}>
            +
          </button>
        )}
      </div>
      </div>

     

      {selectedServer ? (
        <div className="server-content">
          <ServerChat serverId={selectedServer} />
          
        </div>
      ) : (
        <div className="friends-content">
          <Friends />
        </div>
      )}
    </div>
  );
};

export default Servers;
