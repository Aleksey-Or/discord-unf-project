import React from "react";

const ServerIcon = ({ server }) => {
    const { name, color } = server;

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("");

 
  return (
    <div
      className="server-icon"
      style={{ backgroundColor: color, 
        width: "50px",
        height: "50px",
        marginTop: "10px",
        marginBottom: "10px",
        borderRadius: "50%",
        marginLeft: "2vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "bold",
        fontSize: "24px",}}
     
    >
      <p className="server-initials">{initials}</p>
    </div>
    
  );
};

export default ServerIcon;