import React, { useContext, useState } from "react";
import { Dropdown, Menu } from "antd";
import { HiShare } from "react-icons/hi2";
import { ThemeContext } from "../../contexts/themeConfig";
import { BiLogoGmail, BiLogoLinkedin } from "react-icons/bi";
import LinkedInPostPopup from '../Linkedin/LinkedinPostPopup.tsx';
import { toast } from "react-toastify";

const ShareDropdown = ({ handleShareContent, handleLinkedinShareContent, chatPrompt, response }) => {
  const { theme } = useContext(ThemeContext);
  const [isLinkedinPopupOpen, setIsLinkedinPopupOpen] = useState(false);

  // Function to handle click event on menu item
  const handleClick = (item) => {
    if (item.key === "gmail") {
      handleShareContent(chatPrompt, response);
    } else if (item.key === "linkedin") {
      setIsLinkedinPopupOpen(true);
    }
  };

  const handleLinkedinClose = () => {
    setIsLinkedinPopupOpen(false);
  };

  const handleLinkedinShare = async (chatPrompt, editedText) => {
    try {
      await handleLinkedinShareContent(chatPrompt, editedText);
      setIsLinkedinPopupOpen(false);
    } catch (error) {
      if (error.message.includes('authorization expired')) {
        toast.error('LinkedIn session expired. Please try again to re-authorize.', {
          position: "bottom-left",
          autoClose: 5000,
        });
      } else {
        toast.error('Failed to share to LinkedIn. Please try again.', {
          position: "bottom-left",
          autoClose: 3000,
        });
      }
    }
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
    {
      key: "linkedin",
      label: "Post on LinkedIn",
      icon: <BiLogoLinkedin style={iconStyle} />,
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
    <>
    <Dropdown overlay={menu} trigger={["click"]} placement="topLeft">
      <button className="share-icon">
        <HiShare
          size={18}
          style={{ color: theme === "light" ? "#000" : "#fff" }}
        />
      </button>
    </Dropdown>
     <LinkedInPostPopup
     isOpen={isLinkedinPopupOpen}
     onClose={handleLinkedinClose}
     onShare={handleLinkedinShare}
     initialText={response}
     chatPrompt={chatPrompt}
   />
   </>
  );
};

export default ShareDropdown;
