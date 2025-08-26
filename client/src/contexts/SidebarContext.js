import { useState, createContext } from "react";

export const SidebarContext = createContext({
  activeMenu: false,
  setActiveMenu: () => {},
  triggerNavContent: 0,
  setTriggerNavContent: () => {},
  showMenu: false,
  setShowMenu: () => {},
  showMainSidebar: false,
  setShowMainSidebar: () => {},
  showProjectSidebar: false,
  setShowProjectSidebar: () => {},
  showSettingMenu: false,
  setSettingMenu: () => {},
  exploreAgentsMenu: false,
  setExploreAgentsMenu: () => {},
  organizationSettingsMenu: false,
  setOrganizationSettingsMenu: () => {},
  agentListMenu: false,
  setAgentListMenu: () => {},
  knowledgeBaseMenu: false,
  setKnowledgeBaseMenu: () => {},
  trackUsageMenu: false,
  setTrackUsageMenu: () => {},
  removeThreadId: false,
  setRemoveThreadId: () => {},
  showToggleButton: false,
  setShowToggleButton: () => {},
  threadRestore: false,
  setThreadRestore: () => {},
  brandAvatar: null,
  setBrandAvatar: () => {}
});

function SidebarContextProvider(props) {
  const [activeMenu, setActiveMenu] = useState(false);
  const [triggerNavContent, setTriggerNavContent] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showMainSidebar, setShowMainSidebar] = useState(true);
  const [showProjectSidebar, setShowProjectSidebar] = useState(false);
  const [showSettingMenu, setSettingMenu] = useState(false);
  const [exploreAgentsMenu, setExploreAgentsMenu] = useState(false);
  const [organizationSettingsMenu, setOrganizationSettingsMenu] = useState(false);
  const [agentListMenu, setAgentListMenu] = useState(false);
  const [knowledgeBaseMenu, setKnowledgeBaseMenu] = useState(false);
  const [trackUsageMenu, setTrackUsageMenu] = useState(false);
  const [showToggleButton, setShowToggleButton] = useState(false);
  const [removeThreadId, setRemoveThreadId] = useState(false);
  const [threadRestore, setThreadRestore] = useState(false);
  const [brandAvatar, setBrandAvatar] = useState("");

  const contextData = {
    activeMenu,
    setActiveMenu,
    triggerNavContent,
    setTriggerNavContent,
    showMenu,
    setShowMenu,
    showMainSidebar,
    setShowMainSidebar,
    showProjectSidebar,
    setShowProjectSidebar,
    showSettingMenu,
    setSettingMenu,
    exploreAgentsMenu,
    setExploreAgentsMenu,
    organizationSettingsMenu,
    setOrganizationSettingsMenu,
    agentListMenu,
    setAgentListMenu,
    knowledgeBaseMenu,
    setKnowledgeBaseMenu,
    trackUsageMenu,
    setTrackUsageMenu,
    removeThreadId,
    setRemoveThreadId,
    showToggleButton,
    setShowToggleButton,
    threadRestore,
    setThreadRestore,
    brandAvatar,
    setBrandAvatar
  };

  return (
    <SidebarContext.Provider value={contextData}>
      {props.children}
    </SidebarContext.Provider>
  );
}

export default SidebarContextProvider;