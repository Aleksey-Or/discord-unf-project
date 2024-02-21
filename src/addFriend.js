


async function addFriend(userId, friendId) {
    try {
      const userRef = db.collection('users').doc(userId);
      const friendRef = db.collection('users').doc(friendId);
  
      // Check if the user and friend documents exist
      const userDoc = await userRef.get();
      const friendDoc = await friendRef.get();
  
      if (userDoc.exists && friendDoc.exists) {
        // Add the friend to the user's friends collection
        await userRef.collection('friends').doc(friendId).set({
          // You can add additional friend information here
          // For example: displayName, photoURL, etc.
        });
  
        // Add the user to the friend's friends collection
        await friendRef.collection('friends').doc(userId).set({
          // You can add additional friend information here
          // For example: displayName, photoURL, etc.
        });
  
        console.log('Friend added successfully!');
      } else {
        console.error('User or friend document does not exist.');
      }
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  }