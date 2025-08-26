import { BsFillLayersFill, BsRobot } from "react-icons/bs";
import { FaFolderOpen } from "react-icons/fa";
import { IoSettingsOutline, IoGlobeSharp } from "react-icons/io5";
import { RiAccountPinBoxFill } from "react-icons/ri";
import { TbFunction } from "react-icons/tb";
import { LuUsers } from "react-icons/lu";
import { BuildFilled, CalendarOutlined, BarChartOutlined, RobotOutlined, CodeOutlined, BulbOutlined, SettingOutlined } from "@ant-design/icons";

export const pageTitle = {
  "/chat": {
    title: "Multi-provider AI Chat",
    icon: null,
  },
  "/chat/": {
    title: "Multi-provider AI Chat",
    icon: null,
  },
  "/projects": {
    title: "Projects AI Chat",
    icon: null,
  },
  "/projects/": {
    title: "Projects AI Chat",
    icon: null,
  },
  "/knowledge-base": {
    title: "Knowledge Base",
    icon: <FaFolderOpen />,
  },
  "/config": {
    title: "Settings",
    icon: <IoSettingsOutline />,
  },
  "/profile": {
    title: "Account Settings",
    icon: <RiAccountPinBoxFill />,
  },
  "/myAgents": {
    title: "Agent Lists",
    icon: <BsRobot />,
  },
  "/createAgent": {
    title: "Create Agent",
    icon: <BsRobot />,
  },
  "/publicAgents": {
    title: "Public Agents",
    icon: <IoGlobeSharp />,
  },
  "/organizationalAgents": {
    title: "Organizational Agents",
    icon: <BuildFilled />,
  },
  "/createFunction": {
    title: "Create Functions",
    icon: <TbFunction />,
  },
  "/myFunctions": {
    title: "My Functions",
    icon: <TbFunction />,
  },
  "/allFunctions": {
    title: "All Functions",
    icon: <TbFunction />,
  },
  "/userAgents": {
    title: "User Agents",
    icon: <LuUsers />,
  },
  "/public-agent": {
    title: "Explore Agents",
    icon: <BsFillLayersFill />,
  },
  "/reports/monthly": {
    title: "Monthly Report",
    icon: <CalendarOutlined />,
  },
  "/reports/daily": { 
    title: "Daily Report",
    icon: <BarChartOutlined />,
  },
  "/reports/assistant": {
    title: "Assistant Report",
    icon: <RobotOutlined />,
  },
  "/reports/developer": {
    title: "Developer Report",
    icon: <CodeOutlined />,
  },
  "/reports/ai-suggestions": {
    title: "AI Suggestions",
    icon: <BulbOutlined />,
  },
  "/reports/ai-suggestion-settings": {
    title: "AI Suggestion Settings",
    icon: <SettingOutlined />,
  },
};
