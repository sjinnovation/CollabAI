import { BsRobot } from "react-icons/bs";
import { BuildFilled, GlobalOutlined } from "@ant-design/icons";
import { LuUsers } from "react-icons/lu";
import { LucideSquareFunction } from "lucide-react";

export const agentPageSideMenuItems = [
  {
    key: "1",
    icon: <BsRobot className="me-2" />,
    label: "My Agents",
  },
  {
    key: "2",
    icon: <GlobalOutlined className="me-2" />,
    label: "Public Agents",
  },
  {
    key: "4",
    icon: <BuildFilled className="me-2" />,
    label: "Organizational Agents",
  },
  {
    key: "5",
    icon: <LucideSquareFunction style={{ width: "19px" }} className="me-2" />,
    label: "Create Functions",
  },
  {
    key: "7",
    icon: <LuUsers className="me-2" />,
    label: "User Agents",
  },
];

export const agentPageMenuItems = [
  {
    key: "1",
    label: "My Agents",
    navTo: "/myAgents",
    icon: <BsRobot />,
    paths: ["/myAgents", "/createAgent", "/editAgent/:id"],
    roles: ["user", "superadmin"],
  },
  {
    key: "2",
    label: "Public Agents",
    navTo: "/publicAgents",
    icon: <GlobalOutlined />,
    paths: ["/publicAgents"],
    roles: ["superadmin"],
  },
  {
    key: "3",
    label: "Organizational Agents",
    navTo: "/organizationalAgents",
    icon: <BuildFilled />,
    paths: ["/organizationalAgents"],
    roles: ["superadmin"],
  },
  {
    key: "4",
    label: "My Functions",
    navTo: "/myFunctions",
    icon: <LucideSquareFunction style={{ width: 19 }} />,
    paths: ["/myFunctions", "/createFunction"],
    roles: ["user", "superadmin"],
  },
  {
    key: "5",
    label: "All Functions",
    navTo: "/allFunctions",
    icon: <LucideSquareFunction style={{ width: 19 }} />,
    paths: ["/allFunctions"],
    roles: ["superadmin"],
  },
  {
    key: "6",
    label: "User Agents",
    navTo: "/userAgents",
    icon: <LuUsers />,
    paths: ["/userAgents", "/userAgents/:id"],
    roles: ["superadmin"],
  },
];
