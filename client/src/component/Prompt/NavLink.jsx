import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { ThemeContext } from "../../contexts/themeConfig";

const NavLinks = ({ svg, link, text, setChatLog }) => {
  const { theme } = useContext(ThemeContext);
  // const { dispatch } = useContext(AuthContext);

  const handleClick = async (text) => {
    if (text === "Clear Conversations") setChatLog([]);
    if (text === "Log out") {
      try {
        // let logOut = await signOut(auth);
        // console.log("logOut", logOut);
        // dispatch({ type: "LOGOUT" });
      } catch (error) {
        console.log("error happen during sign out", error);
      }
    }
  };

  return (
    <Link
      to={link}
      // target={link && "_blank"}
      target={link && "_self"}
      rel="noreferrer"
      style={{
        textDecoration: "none",
        color: theme === "light" ? "#000" : "#fff",
      }}
      onClick={() => handleClick(text)}
    >
      <div className="navPrompt">
        {svg}
        <p>{text}</p>
      </div>
    </Link>
  );
};

export default NavLinks;
