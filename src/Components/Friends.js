import React from "react";
import "./style.css";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState, useEffect } from "react";
import { addFriend } from "../firebase";

import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";

import FriendChat from "./FriendChat";

const Friends = () => {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [friendId, setFriendId] = useState("");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friends, setFriends] = useState([]);
  const uid = user.uid;
  const [selectedFriend, setSelectedFriend] = useState(null);

  const fetchFriends = async () => {
    try {
      const userFriendsRef = collection(db, "users", uid, "friends");
      const friendsSnapshot = await getDocs(userFriendsRef);
      const friendIds = friendsSnapshot.docs.map((doc) => doc.id);
      const friendData = await Promise.all(
        friendIds.map(async (friendId) => {
          const friendRef = doc(db, "users", friendId);
          const friendDoc = await getDoc(friendRef);
          if (friendDoc.exists()) {
            const friendData = friendDoc.data();
            return { friendId, ...friendData };
          }
        })
      );
      setFriends(friendData);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleToggleAddFriend = () => {
    setShowAddFriend((prevState) => !prevState);
  };

  const handleAddFriend = () => {

    if (friendId === uid) {
      console.log("You cannot add yourself as a friend.");
      return;
    }

    addFriend(uid, friendId);

    setFriendId("");
  };

  const removeFriend = async (friendId) => {
    try {
      console.log("Friend ID:", friendId);
      const user = auth.currentUser;
      const userRef = doc(db, "users", user.uid);
      const friendRef = doc(db, "users", friendId);

    
      const userFriendSnapshot = await getDoc(doc(userRef, "friends", friendId));
      if (!userFriendSnapshot.exists()) {
        console.error("Friend does not exist in user's friends list.");
        return;
      }

      const friendFriendSnapshot = await getDoc(doc(friendRef, "friends", user.uid));
      if (!friendFriendSnapshot.exists()) {
        console.error("User does not exist in friend's friends list.");
        return;
      }

      await deleteDoc(doc(userRef, "friends", friendId));

      await deleteDoc(doc(friendRef, "friends", user.uid));

      console.log("Friend removed successfully!");
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const handleFriendClick = (friend) => {
    console.log("Friend object:", friend);
    setSelectedFriend(friend);
    console.log("Selected Friend:", friend.displayName);
  };

  return (
    <div className="friends-wrapper">
    <div className="friends-section">
      <div className="friends-header">
        <h2>Friends</h2>
        <button className="button" onClick={handleToggleAddFriend}>
          {showAddFriend ? "Cancel" : "Add Friend"}
        </button>
      </div>
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
      <div className="friends-list">
        {friends.length > 0 ? (
          friends.map((friend) => {
            console.log("Friend Object:", friend);
            console.log("Friend ID:", friend.friendId);

            return (
              <button className="friend-button" onClick={() => handleFriendClick(friend)} key={friend.uid}>
                
                  <img className="photo" src={friend.photoURL} alt={friend.displayName} />
                  <p className="friend-name">{friend.displayName}</p>
                  <button className="remove-friend-button"onClick={() => removeFriend(friend.friendId)}>
                    Remove Friend
                  </button>
                
              </button>
            );
          })
        ) : (
          <p>No friends yet.</p>
        )}
      </div>
      </div>
      <div className="friend-chat-wrapper">
        {selectedFriend ? (
          <FriendChat friend={selectedFriend} />
        ) : (
          <p className="select-friend-placeholder">Select a friend to chat</p>
        )}
      </div>
    </div>
  );
};

export default Friends;