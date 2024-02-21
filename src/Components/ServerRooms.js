import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./style.css";
import Peer from "peerjs";

const ServerRooms = ({ serverId }) => {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [rooms, setRooms] = useState([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [connections, setConnections] = useState([]);
  const peer = new Peer(user.uid);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const serverDocRef = doc(db, "servers", serverId);
        const serverRoomsQuery = query(collection(serverDocRef, "rooms"));
        const serverRoomsSnapshot = await getDocs(serverRoomsQuery);
        const roomData = serverRoomsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomData);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();

    const serverDocRef = doc(db, "servers", serverId);
    const serverRoomsRef = collection(serverDocRef, "rooms");
    const roomsListener = onSnapshot(serverRoomsRef, (snapshot) => {
      const updatedRooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(updatedRooms);
    });

    return () => {
      roomsListener();
    };
  }, [serverId]);

  const handleCreateRoom = async () => {
    try {
      setShowCreateRoom(true);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };
  const handleCloseCreateRoom = () => {
    
      setShowCreateRoom(false);
    
  };
  const handleCreateRoomSubmit = async () => {
    try {
      const serverDocRef = doc(db, "servers", serverId);
      const roomData = {
        name: roomName,
        
      };

      const docRef = await addDoc(collection(serverDocRef, "rooms"), roomData);
      const roomId = docRef.id;
      console.log("New room created with ID:", roomId);
      setRoomName('')
      setShowCreateRoom(false);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleRoomClick = (room) => {
    console.log("Room clicked:", room);
    console.log("Room ID:", room.id);
    console.log("User ID:", user.uid);

    if (room.id && user.uid) {
      joinRoom(room.id, user.uid, user.photoURL);
    } else {
      console.error("Invalid room or user ID");
    }
  };

  const handleDisconnect = (room) => {
    const roomId = encodeURIComponent(room.id);
    const userId = encodeURIComponent(user.uid);
    if (room.id && user.uid) {
      disconnectFromRoom(roomId, userId);
    } else {
      console.error("Invalid room or user ID");
    }
  };

  const joinRoom = async (roomId, userId, photoURL) => {
    try {
      const roomRef = doc(db, "servers", serverId, "rooms", roomId);
      const roomSnapshot = await getDoc(roomRef);

      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.data();
        const users = roomData.users || [];
        await updateUserPresence(roomRef, userId, true);

        
        for (const [otherUserId, otherUserData] of Object.entries(users)) {
          if (otherUserId !== userId && otherUserData.present) {
            const conn = peer.connect(otherUserId);
            console.log('connecting to ')
            setConnections((prevConnections) => [...prevConnections, conn]);

            conn.on("open", () => {
              console.log("Connected to:", otherUserId);

              conn.on("data", (data) => {
                console.log("Received:", data);
              });

              conn.send("Hello!");
            });
          }
        }
      } else {
        console.error("Room document does not exist");
      }
    } catch (error) {
      console.error("Error joining the room:", error);
    }
  };

  const updateUserPresence = async (roomRef, userId, isPresent) => {
    try {
      const roomSnapshot = await getDoc(roomRef);

      if (roomSnapshot.exists()) {
        await updateDoc(roomRef, {
          [`users.${userId}.present`]: isPresent,
          [`users.${userId}.photoURL`]: user.photoURL,
          [`users.${userId}.userId`]: user.uid,
        });
      } else {
        console.error("Room document does not exist");
      }
    } catch (error) {
      console.error("Error updating user presence:", error);
    }
  };

  const disconnectFromRoom = async (roomId, userId) => {
    try {
      const roomRef = doc(db, "servers", serverId, "rooms", roomId);
      await deleteDoc(doc(collection(roomRef, "users"), userId));
      await updateUserPresence(roomRef, userId, false);
    } catch (error) {
      console.error("Error disconnecting from the room:", error);
    }
  };

  return (
    <div className="server-rooms">
      <h2>Server Rooms</h2>
      {rooms.map((room) => (
        <div key={room.id}>
          <div className="server-room" onClick={() => handleRoomClick(room)}>
            <h3>{room.name}</h3>
            {room.users &&
              Object.keys(room.users).map((userId) => {
                const userData = room.users[userId];
                const isPresent = userData.present;
                const isNewUser = userId !== user.uid;

                if (isPresent) {
                  
                  if (isNewUser) {
                    //console.log("New user added with different ID:", userData);
                  }

                 // console.log("New user added:", userData);
                  return (
                    <div key={userId}>
                      <img className="photo" src={userData.photoURL} alt="User Profile" />
                      <p>{userData.name}</p>
                      <p>{userData.email}</p>
                      
                    </div>
                  );
                }
                return null;
              })}
          </div>
          <button className="disconnect-button" onClick={() => handleDisconnect(room)}>Disconnect</button>
        </div>
      ))}

      {!showCreateRoom ? (
        <button className="button" onClick={handleCreateRoom}>
          Create Room
        </button>
      ) : (

        <div className="create-room-form">
          <button className="button" onClick={handleCloseCreateRoom}>
          Cancel
        </button>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter room name"
          />
          <button className="button" onClick={handleCreateRoomSubmit}>
            Create
          </button>
        </div>
      )}
    </div>
  );
};

export default ServerRooms;
