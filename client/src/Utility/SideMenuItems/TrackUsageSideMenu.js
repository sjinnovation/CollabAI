import { BarChartOutlined, CalendarOutlined, RobotOutlined, CodeOutlined, BulbOutlined, SettingOutlined } from "@ant-design/icons";

export const trackUsageSideMenuItems = [
  {
    key: "1",
    label: "Monthly Report",
    navTo: "/reports/monthly",
    icon: <CalendarOutlined />,
    paths: ["/reports/monthly"],
    roles: ["superadmin"],
  },
  {
    key: "2",
    label: "Daily Report",
    navTo: "/reports/daily",
    icon: <BarChartOutlined />,
    paths: ["/reports/daily"],
    roles: ["superadmin"],
  },
  {
    key: "3",
    label: "Assistant Report",
    navTo: "/reports/assistant",
    icon: <RobotOutlined />,
    paths: ["/reports/assistant"],
    roles: ["superadmin"],
  },
  // {
  //   key: "4",
  //   label: "Developer Report",
  //   navTo: "/reports/developer",
  //   icon: <CodeOutlined />,
  //   paths: ["/reports/developer"],
  //   roles: ["superadmin"],
  // },
  {
    key: "5",
    label: "AI Suggestions",
    navTo: "/reports/ai-suggestions",
    icon: <BulbOutlined />,
    paths: ["/reports/ai-suggestions"],
    roles: ["superadmin"],
  },
  {
    key: "6",
    label: "AI Suggestion Settings",
    navTo: "/reports/ai-suggestion-settings",
    icon: <SettingOutlined />,
    paths: ["/reports/ai-suggestion-settings"],
    roles: ["superadmin"],
  },
]; 