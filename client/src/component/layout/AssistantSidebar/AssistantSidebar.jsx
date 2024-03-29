import React, { useContext } from "react";
import { SidebarContext } from "../../../contexts/SidebarContext";

import AssistantSidebarContent from "./AssistantSidebarContent";

const AssistantSidebar = () => {
    const { showMenu } = useContext(SidebarContext);

    return (
        <aside className={showMenu ? "sideMenuResponsive" : "sideMenu"}>
            <AssistantSidebarContent />
        </aside>
    );
};

export default AssistantSidebar;
