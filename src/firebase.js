import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, addDoc, updateDoc, getDocs, getDoc, serverTimestamp, query, where, orderBy, limit } from "firebase/firestore";

import "firebase/auth";

import "@firebase/auth";

import "firebase/compat/firestore";

import "firebase/compat/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB1C9j5foxDcDrcenTpnh_Iek5Q74POBTo",
  authDomain: "discordclone-2a802.firebaseapp.com",
  projectId: "discordclone-2a802",
  storageBucket: "discordclone-2a802.appspot.com",
  messagingSenderId: "1020474040372",
  appId: "1:1020474040372:web:af4b78316cd9fb76a2aa61",
  databaseURL: "https://discordclone-2a802-default-rtdb.europe-west1.firebasedatabase.app",

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app)
async function createOrUpdateUserProfile(uid, displayName, email, photoURL) {
  const usersRef = collection(db, "users");

  try {
    const userDoc = doc(usersRef, uid);
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      await updateDoc(userDoc, {
        displayName,
        email,
        photoURL,
      });
    } else {
      await setDoc(userDoc, {
        displayName,
        email,
        photoURL,
        
      });
    }
    
      
      
    console.log("User profile created/updated successfully!");
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
  }
}

// Usage example
const user = auth.currentUser;
if (user) {
  // User is logged in, create or update the user profile
  createOrUpdateUserProfile(
    user.uid,
    user.displayName,
    user.email,
    user.photoURL
  );
}
async function createChatWithFriend(friendId) {
  try {
    const user = auth.currentUser;
    const userRef = doc(db, "users", user.uid);
    const friendRef = doc(db, "users", friendId);

    // Check if the friend is already in the user's friends list
    const friendsSnapshot = await getDocs(collection(userRef, "friends"));
    const isFriend = friendsSnapshot.docs.some((doc) => doc.id === friendId);

    if (!isFriend) {
      console.log("This user is not your friend.");
      return;
    }

    // Check if the chat already exists between the user and friend
    const chatQuerySnapshot = await getDocs(
      query(
        collection(db, "chats"),
        where("participants", "array-contains", friendId),
        limit(1)
      )
    );

    if (!chatQuerySnapshot.empty) {
      console.log("Chat already exists with this friend.");
      return;
    }

    // Create a new chat document
    const chatData = {
      participants: [user.uid, friendId],
      createdAt: serverTimestamp(),
      // Add additional chat data if needed
    };

    const chatDocRef = await addDoc(collection(db, "chats"), chatData);

    // Add the chat reference to the user's chats subcollection
    await setDoc(doc(userRef, "chats", chatDocRef.id), {
      // Add additional chat information here
      // For example: name, description, etc.
    });

    console.log("Chat created successfully!");
  } catch (error) {
    console.error("Error creating chat:", error);
  }
}

async function addFriend(uid, friendId) {
  try {
    const userRef = doc(db, "users", uid);
    const friendRef = doc(db, "users", friendId);

    // Check if the user and friend documents exist
    const userDoc = await getDoc(userRef);
    const friendDoc = await getDoc(friendRef);

    if (userDoc.exists() && friendDoc.exists()) {
      // Add the friend to the user's friends subcollection
      await setDoc(doc(userRef, "friends", friendId), {
        // You can add additional friend information here
        // For example: displayName, photoURL, etc.
      });
      
      // Add the user to the friend's friends subcollection
      await setDoc(doc(friendRef, "friends", uid), {
        // You can add additional friend information here
        // For example: displayName, photoURL, etc.
      });
      createChatWithFriend(friendId)
      console.log("Friend added successfully!");
    } else {
      console.error("User or friend document does not exist.");
    }
  } catch (error) {
    console.error("Error adding friend:", error);
  }
}


const createServer = async (name, description, creatorUid) => {
  try {
    const serversCollectionRef = collection(db, "servers");
    await addDoc(serversCollectionRef, {
      name: name,
      description: description,
      members: [creatorUid], // Include the creator's UID in the members array
    });
    console.log("Server created successfully!");
  } catch (error) {
    console.error("Error creating server:", error);
  }
};




export { auth, provider, addFriend, createOrUpdateUserProfile, db, createServer, database};

/* 
const userId1 = '123456'; // User ID 1
const friendId1 = '987654'; // Friend ID 1

addFriend(userId1, friendId1);
addFriend(friendId1, userId1);


*/
