import React, { useContext } from "react";
import { Dropdown, Menu } from "antd";
import { HiShare } from "react-icons/hi2";
import { ThemeContext } from "../../contexts/themeConfig";
import { BiLogoGmail } from "react-icons/bi";

const ShareDropdown = ({ handleShareContent, chatPrompt, response }) => {
  const { theme } = useContext(ThemeContext);

  // Function to handle click event on menu item
  const handleClick = (item) => {
    handleShareContent(chatPrompt, response);
  };

  const menuStyle = {
    backgroundColor: theme === "light" ? "#fff" : "#31363F",
    color: theme === "light" ? "#000" : "#fff",
  };

  const iconStyle = {
    color: theme === "light" ? "#000" : "#fff",
    marginRight: "8px",
    fontSize: "18px",
  };

  // Define menu items
  const menuItems = [
    {
      key: "gmail",
      label: "Draft in Gmail",
      icon: <BiLogoGmail style={iconStyle} />,
    },
  ];

  // Create a Menu component with the defined menu items
  const menu = (
    <Menu onClick={handleClick} style={menuStyle} className="shadow-lg">
      {menuItems.map((item) => (
        <Menu.Item key={item.key} icon={item.icon}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="topLeft">
      <button className="share-icon">
        <HiShare
          size={18}
          style={{ color: theme === "light" ? "#000" : "#fff" }}
        />
      </button>
    </Dropdown>
  );
};

export default ShareDropdown;
