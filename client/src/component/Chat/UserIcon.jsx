import React from "react";
import Avatar from "../common/Avatar";

const UserIcon = () => {
  return (
    <Avatar bg="#5437DB" className="userSVG">
      <svg
        stroke="currentColor"
        fill="none"
        strokeWidth={1.9}
        viewBox="0 0 24 24"
        className="h-6 w-6"
        height={40}
        width={40}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx={12} cy={7} r={4} />
      </svg>
    </Avatar>
  );
};

export default UserIcon;
