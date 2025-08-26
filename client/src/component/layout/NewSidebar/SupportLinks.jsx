import { useContext, useState } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { Menu, Popover } from "antd";
import { IoDocumentText } from "react-icons/io5";
import { HiAcademicCap } from "react-icons/hi2";
import { RiBug2Fill } from "react-icons/ri";
import { MdBrowserUpdated } from "react-icons/md";
import { ThemeContext } from "../../../contexts/themeConfig";
import "./SupportLinks.css";

const SupportLinks = () => {
  const { theme } = useContext(ThemeContext);
  const [isSubNavOpen, setIsSubNavOpen] = useState(false);

  const handleVisibleChange = (visible) => {
    setIsSubNavOpen(visible);
  };

  const menuItems = [
    {
      key: "1",
      icon: (
        <IoDocumentText
          size={22}
          className="icon-popover"
        />
      ),
      label: (
        <a
          href="https://academy.collabai.software/"
          target="_blank"
          rel="noopener noreferrer"
          className={`sub-navigation__link ${theme}`}
        >
          Academy
        </a>
      ),
    },
    {
      key: "2",
      icon: (
        <HiAcademicCap
          size={22}
          className="icon-popover"
        />
      ),
      label: (
        <a
          href="https://docs.google.com/document/d/1McErUX9EPKh-I08uRPp8iwLFW78Ej7fBicn0fJtoRgQ/edit?tab=t.powvmwjcec9p#heading=h.v90wafxjzo4f/"
          target="_blank"
          rel="noopener noreferrer"
          className={`sub-navigation__link ${theme}`}
        >
          Product Guide
        </a>
      ),
    },
    {
      key: "3",
      icon: (
        <RiBug2Fill
          size={22}
          className="icon-popover"
        />
      ),
      label: (
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSeWtj0L3SYvLmQNETh19dJgrezPlL-ibsQRJLWuiLpZGBv86g/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className={`sub-navigation__link ${theme}`}
        >
          Submit An Issue
        </a>
      ),
    },
    {
      key: "4",
      icon: (
        <MdBrowserUpdated
          size={22}
          className="icon-popover"
        />
      ),
      label: (
        <a
          href="https://docs.google.com/document/d/1McErUX9EPKh-I08uRPp8iwLFW78Ej7fBicn0fJtoRgQ/edit?tab=t.m1oswktdfe36#heading=h.b4dleky2g56i"
          target="_blank"
          rel="noopener noreferrer"
          className={`sub-navigation__link ${theme}`}
        >
          ChangeLog
        </a>
      ),
    },
  ];

  const onClick = (e) => {
    setIsSubNavOpen(false);
  };

  const content = (
    <Menu
      onClick={onClick}
      mode="vertical"
      items={menuItems}
      className={`menu ${theme}`}
    />
  );

  return (
    <div className={`popover-container ${theme}`}>
      <Popover
        content={content}
        trigger={["hover"]}
        visible={isSubNavOpen}
        onVisibleChange={handleVisibleChange}
        placement="right"
        overlayClassName={`popover-overlay ${theme}`}
        mouseEnterDelay={0.1}
        mouseLeaveDelay={0.3}
      >
        <div
          className={`popover-trigger ${theme}`}
          onClick={(e) => e.stopPropagation()}
        >
          <RiArrowRightLine
            size={22}
            className={`arrow-icon ${isSubNavOpen ? "open" : "closed"}`}
          />
          <span className="support-links-text">Support Links</span>
        </div>
      </Popover>
    </div>
  );
};

export default SupportLinks;