import React from "react";
import "./UserAvatar.scss";

const UserAvatar = ({ userAvatar, width = 25, height = 25 }) => {
  return (
    <img
      className="user-avatar"
      width={width}
      height={height}
      src={userAvatar}
      alt=""
    />
  );
};

export default UserAvatar;