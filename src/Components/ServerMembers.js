import React from "react";

const ServerMembers = ({ members, addFriendToServer }) => {
  return (
    <div className="members-section">
      <h3>Members:</h3>
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            <p>{member.displayName}</p>
            <img src={member.photoURL} alt={member.displayName} />
          </li>
        ))}
      </ul>
      <button onClick={addFriendToServer}>Add Friend</button>
    </div>
  );
};

export default ServerMembers;