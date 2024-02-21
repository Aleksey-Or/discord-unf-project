import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

const FriendChat = ({ friend }) => {
  const auth = getAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState(null);
  const [user, loading, error] = useAuthState(auth);

  const fetchChat = async () => {
    const userId = user.uid;
    const friendId = friend.friendId;
    const participants = [userId, friendId];
    const chatQueryRef = query(
      collection(db, "chats"),
      where("participants", "array-contains", friendId)
    );

    const chatSnapshot = await getDocs(chatQueryRef);
    console.log("Chat snapshot:", chatSnapshot);

    if (!chatSnapshot.empty) {
      const existingChat = chatSnapshot.docs[0];
      const chatId = existingChat.id;
      console.log("Chat ID:", chatId);
      setChatId(chatId);

      const messagesRef = collection(db, "chats", chatId, "messages");
      const messagesSnapshot = await getDocs(messagesRef);

      if (messagesSnapshot.empty) {
        await addDoc(messagesRef, { placeholder: true });
      }

      onSnapshot(
        query(
          collection(db, "chats", chatId, "messages"),
          orderBy("timestamp", "asc")
        ),
        (snapshot) => {
          const chatMessages = snapshot.docs.map((doc) => {
            const data = doc.data();
            const { id } = doc;
            return { id, ...data };
          });
          setMessages(chatMessages);

          console.log("Chat document name:", existingChat.id);
        },
        (error) => {
          console.error("Error fetching chat messages:", error);
        }
      );
    }
  };

  useEffect(() => {
    fetchChat();
  }, [user, friend]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!chatId) {
      return;
    }

    try {
      const messageData = {
        content: input,
        photoURL: user.photoURL,
        timestamp: serverTimestamp(),
      };

      const messageRef = collection(db, "chats", chatId, "messages");
      await addDoc(messageRef, messageData);

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  return (
    <div className="chat-window">
      <div className="chat-messages">
        <div className="message-container">
          {messages.map((message) => (
            <div key={message.timestamp} className="message">
              <img className="photo" src={message.photoURL}></img>
              <p>{message.content}</p>
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
  );
};

export default FriendChat;
