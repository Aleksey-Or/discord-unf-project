import firebase from 'firebase/compat/app';
import 'firebase/firestore';

const auth = getAuth();

async function createOrUpdateUserProfile(uid, displayName, email, photoURL) {
  const usersRef = firebase.firestore().collection('users');

  try {
    // Check if the profile document already exists
    const userDoc = await usersRef.doc(uid).get();

    if (userDoc.exists) {
      // Profile document already exists, update it if needed
      await usersRef.doc(uid).update({
        displayName,
        email,
        photoURL,
        // Add any other fields you want to update
      });
    } else {
      // Profile document doesn't exist, create a new one
      await usersRef.doc(uid).set({
        displayName,
        email,
        photoURL,
        // Add any other fields you want to set
      });
    }

    console.log('User profile created/updated successfully!');
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
  }
}

// Usage example
const user = firebase.auth().currentUser;

if (user) {
  createOrUpdateUserProfile(user.uid, user.displayName, user.email, user.photoURL);
}