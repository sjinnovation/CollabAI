import { CgProfile } from "react-icons/cg";
import NavLinks from "../../Prompt/NavLink";
import { getUserTeamAccessStatus } from "../../../Utility/service";
import React, { useContext } from "react";
import { ThemeContext } from "../../../contexts/themeConfig";

const UserNavLinks = () => {
  const { theme } = useContext(ThemeContext);
  const checkAccess = getUserTeamAccessStatus();

  return (
    <div>
      <NavLinks
        svg={
          <CgProfile
            size={22}
            style={{ color: theme === "light" ? "#000" : "#fff" }}
          />
        }
        text="My Profile"
        link="/profile"
      />

      <NavLinks
        svg={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.5em"
            height="1.5em"
            style={{ color: theme === "light" ? "#000" : "#fff" }}
            className="bi bi-file-earmark-bar-graph"
            viewBox="0 0 16 16"
          >
            <path d="M10 13.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v6zm-2.5.5a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1zm-3 0a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-1z" />
            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
          </svg>
        }
        text="Prompt Templates"
        link="/templates"
      />

      {checkAccess ? (
        <NavLinks
          svg={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5em"
              height="1.5em"
              style={{ color: theme === "light" ? "#000" : "#fff" }}
              className="bi bi-file-earmark-bar-graph"
              viewBox="0 0 16 16"
            >
              <path d="M10 13.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v6zm-2.5.5a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1zm-3 0a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-1z" />
              <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
            </svg>
          }
          text="My Agents"
          link="/users-agents"
        />
      ) : null}
    </div>
  );
};

export default UserNavLinks;
