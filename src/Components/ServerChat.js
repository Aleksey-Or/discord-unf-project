import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import "./style.css";
import { db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, signOut } from "firebase/auth";
import ServerRooms from "./ServerRooms";

const ServerChat = ({ serverId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const auth = getAuth();
  const [user] = useAuthState(auth);
  const [members, setMembers] = useState([]);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendId, setFriendId] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const serverRef = doc(db, "servers", serverId);
        const serverSnapshot = await getDoc(serverRef);

        if (serverSnapshot.exists()) {
          const serverData = serverSnapshot.data();
          const memberIds = serverData.members || [];

          const memberPromises = memberIds.map(async (memberId) => {
            const userRef = doc(db, "users", memberId);
            const userSnapshot = await getDoc(userRef);
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data();
              return {
                id: memberId,
                displayName: userData.displayName,
                photoURL: userData.photoURL,
              };
            }
            return null;
          });

          const membersData = await Promise.all(memberPromises);
          const filteredMembersData = membersData.filter(
            (memberData) => memberData !== null
          );

          setMembers(filteredMembersData);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, [serverId]);
  const handleToggleAddFriend = () => {
    setShowAddFriend(!showAddFriend);
    setFriendId("");
  };

  const handleAddFriend = async () => {
    try {
      if (friendId) {
        const serverRef = doc(db, "servers", serverId);
        const serverSnapshot = await getDoc(serverRef);

        if (serverSnapshot.exists()) {
          const serverData = serverSnapshot.data();
          const currentMembers = serverData.members || [];

          if (!currentMembers.includes(friendId)) {
            await updateDoc(serverRef, {
              members: arrayUnion(friendId),
            });
            setFriendId("");
            console.log("Friend added successfully!");
          } else {
            setFriendId("");
            console.log("Friend is already a member of the server.");
          }
        } else {
          setFriendId("");
          console.log("Server does not exist.");
        }
      }
    } catch (error) {
      setFriendId("error");
      console.error("Error adding friend:", error);
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const serverRef = doc(db, "servers", serverId);
        const serverSnapshot = await getDoc(serverRef);

        if (serverSnapshot.exists()) {
          const serverData = serverSnapshot.data();
          const messagesData = serverData.messages || [];
          setMessages(messagesData);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

  
    const serverRef = doc(db, "servers", serverId);
    const unsubscribe = onSnapshot(serverRef, (doc) => {
      if (doc.exists()) {
        const serverData = doc.data();
        const messagesData = serverData.messages || [];
        setMessages(messagesData);
      }
    });

    return () => {
      
      unsubscribe();
    };
  }, [serverId]);

  const sendMessage = async (e) => {
    e.preventDefault();

    try {
      const messageData = {
        text: input,
        timestamp: new Date(),
        userId: user.uid,
        userName: user.displayName,
        userImage: user.photoURL,
      };

      const serverRef = doc(db, "servers", serverId);
      await updateDoc(serverRef, {
        messages: [...messages, messageData],
      });

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);
  const name = serverId;
  return (
    <div className="chat">
      <div className="chat-user-menu">
        <ServerRooms serverId={serverId} />
        <div className="chat-members">
          <h3>Members:</h3>
          <ul>
            {members.map((member) => (
              <li key={member.id}>
                <img
                  className="photo"
                  src={member.photoURL}
                  alt={member.displayName}
                />
                <p>{member.displayName}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="add-friend">
          <button className="button" onClick={handleToggleAddFriend}>
            {showAddFriend ? "Cancel" : "Add Friend"}
          </button>
          {showAddFriend && (
            <div className="add-friend-form">
              <input
                type="text"
                placeholder="Enter user ID"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
              />
              <button className="button" onClick={handleAddFriend}>
                Add
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="chat-window">
        <div ref={messagesRef} className="chat-messages">
          <div className="message-container">
            {messages.map((message, index) => (
              <div key={index} className="message">
                <p>{message.userName}</p>
                <img
                  className="photo"
                  src={message.userImage}
                  alt={message.userName}
                />

                <p>{message.text}</p>
              </div>
            ))}
          </div>
        </div>
        <form className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit" onClick={sendMessage}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServerChat;
