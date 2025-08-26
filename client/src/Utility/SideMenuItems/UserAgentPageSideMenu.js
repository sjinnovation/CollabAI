import { BuildFilled, HeartOutlined } from "@ant-design/icons";
import { LucideSquareFunction } from "lucide-react";
import { BsRobot } from "react-icons/bs";
import { MdOutlineAssistant } from "react-icons/md";

export const userAgentPageSideMenuItems = [
  {
    key: "1",
    icon: <BsRobot className="me-2" />,
    label: "My Agents",
  },

  {
    key: "4",
    icon: <LucideSquareFunction style={{width:"19px"}} className="me-2" />,
    label: "Create Functions",
  },
];
