import React, { useContext, useEffect } from "react";
import NavContent from "../../Prompt/NavContent";
import { SidebarContext } from "../../../contexts/SidebarContext";
import "./NewSidebar.css";
import NavContentDuplicate from "../../Prompt/NavContentDuplicate";

const NewSidebar = () => {
  const { triggerNavContent, showMenu } = useContext(SidebarContext);

  useEffect(() => {
    console.log(showMenu);
  }, [showMenu]);

  return (
    <>
      {/* <aside className={showMenu ? "sideMenuResponsive" : "sideMenu"}> */}
      <aside className={`sideMenu`}>
        {/* <NavContent
                    triggerUpdate={triggerNavContent}
                /> */}
        <NavContentDuplicate triggerUpdate={triggerNavContent} />
      </aside>
    </>
  );
};

export default NewSidebar;
