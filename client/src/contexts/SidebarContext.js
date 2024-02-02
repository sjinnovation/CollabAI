import { useState, createContext } from "react";

export const SidebarContext = createContext();

function SidebarContextProvider(props) {
    const [activeMenu, setActiveMenu] = useState(false);
    const [triggerNavContent, setTriggerNavContent] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const [removeThreadId, setRemoveThreadId] = useState(false);

    const contextData = {
        activeMenu,
        setActiveMenu,
        triggerNavContent,
        setTriggerNavContent,
        showMenu,
        setShowMenu,
        removeThreadId,
        setRemoveThreadId
    };

    return (
        <SidebarContext.Provider value={contextData}>
            {props.children}
        </SidebarContext.Provider>
    );
}

export default SidebarContextProvider;
