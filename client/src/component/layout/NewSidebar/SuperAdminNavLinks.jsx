import { CgProfile } from "react-icons/cg";
import NavLinks from "../../Prompt/NavLink";
import { BsRobot } from "react-icons/bs";
import { FaTags } from "react-icons/fa6";
import { AiOutlineTeam } from "react-icons/ai";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import React, { useContext } from "react";
import { ThemeContext } from "../../../contexts/themeConfig";
import { AlignLeftOutlined } from "@ant-design/icons"
import { GrTasks } from "react-icons/gr";
import { SlOrganization } from "react-icons/sl";
import { FaBrain } from "react-icons/fa";

const SuperAdminNavLinks = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <div>
      <NavLinks
        svg={
          <CgProfile
            size={22}
            style={{ color: theme === "light" ? "#000" : "#fff" }}
          />
        }
        text="Account Settings"
        link="/profile"
      />
      <NavLinks
        svg={
           <SlOrganization
           size={22}
             style={{ color: theme === "light" ? "#000" : "#fff" }}/>
        }
        text="Organization Settings"
        link="/config"
      />



      <NavLinks
        svg={
          <FaMoneyBillTrendUp
            size={22}
            style={{ color: theme === "light" ? "#000" : "#fff" }}
          />

        }
        text="Reports"
        link="/reports"
      />

      <NavLinks
        svg={
          <AlignLeftOutlined
            size={22}
            style={{ color: theme === "light" ? "#000" : "#fff" }}
          />

        }
        text="Agent Types"
        link="/agent-types"
      />
      {/*
                            // [NOTE: commenting for now, in future will be updated]   
                           <NavLinks
                              svg={
                                  <MdSubscriptions
                                      style={{
                                          color: "#FFFFFF",
                                          fontSize: "23px",
                                      }}
                                  />
                              }
                              text="Subscriptions"
                              link="/subscriptions"
                          /> */}
      <NavLinks
        svg={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            style={{ color: theme === "light" ? "#000" : "#fff" }}
            className="bi bi-file-earmark-bar-graph"
            viewBox="0 0 16 16"
          >
            <path d="M10 13.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v6zm-2.5.5a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-1zm-3 0a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-1z" />
            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" />
          </svg>
        }
        text="Users"
        link="/users"
      />
      <NavLinks
      // commenting for now, in future will be updated
        svg={
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-envelope-check" viewBox="0 0 16 16">
            <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z" />
            <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686" />
          </svg>

        }

        text="Authorize Email Domain"
        link="/authorizeEmailDomain"
      />
      {/*
                          // commenting for now, in future will be updated
                           <NavLinks
                              svg={
                                  <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="1.5em"
                                      height="1.5em"
                                      style={{ color: "white" }}
                                      className="bi bi-geo-alt"
                                      viewBox="0 0 16 16"
                                  >
                                      <path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z" />
                                      <path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                  </svg>
                              }
                              text="Track Usage"
                              link="/trace"
                          /> */}

      <NavLinks
        svg={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            style={{ color: theme === "light" ? "#000" : "#fff" }}
            className="bi bi-card-list"
            viewBox="0 0 16 16"
          >
            <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
            <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
          </svg>
        }
        text="Prompt Templates"
        link="/templist"
      />
      <NavLinks
        svg={
          <AiOutlineTeam
            size={22}
            style={{ color: theme === "light" ? "#000" : "#fff" }}
          />
        }
        text="Teams"
        link="/teams"
      />
      <NavLinks
        svg={
          //   <svg
          //       xmlns="http://www.w3.org/2000/svg"
          //       width="1.5em"
          //       height="1.5em"
          //       style={{ color: "white" }}
          //       className="bi bi-card-list"
          //       viewBox="0 0 16 16"
          //   >
          //       <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
          //       <path d="M5 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 5 8zm0-2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM4 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
          //   </svg>
          <BsRobot
            size={22}
            style={{ color: theme === "light" ? "#000" : "#fff" }}
          />
        }
        text="Agents"
        link="/myAgents"
      />
      {/* [TODO : commenting for now, will be added later when organization functionality will be enabled ] */}
      {/* <NavLinks
                svg={<VscOrganization size={25} color="white"/>}
                text="Organizations"
                link="/organizations"
            /> */}

      <NavLinks
        svg={
          <GrTasks
            size={22}
            style={{ color: theme === "light" ? "#000" : "#fff" }}
          />
        }
        text="Task Commands"
        link="/taskCommands"
      />
      <NavLinks
        svg={
          <FaBrain
            size={22}
            style={{ color: theme === "light" ? "#000" : "#fff" }}
          />
        }
        text="Instructions"
        link="/instructions"
      />
    </div>
  );
};

export default SuperAdminNavLinks;