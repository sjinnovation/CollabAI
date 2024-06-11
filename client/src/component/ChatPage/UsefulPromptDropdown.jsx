import React, { useState, useEffect, useContext } from "react";
import { Menu, Dropdown, Spin } from "antd";
import { getTaskCommandsGroupedByCategory } from "../../api/taskCommands";
import { ThemeContext } from "../../contexts/themeConfig";

import * as AntDesignIcons from "@ant-design/icons";
import * as ReactAntIcons from "react-icons/ai";
import * as ReactFlatIcons from "react-icons/fc";
import * as ReactFontAwesomeFive from "react-icons/fa";
import * as ReactFontAwesomeSix from "react-icons/fa6";

// constants
const DROPDOWN_WIDTH = 280;

const iconLibraries = [
  AntDesignIcons,
  ReactAntIcons,
  ReactFlatIcons,
  ReactFontAwesomeFive,
  ReactFontAwesomeSix,
];

const UsefulPromptDropdown = (props) => {
  const { theme } = useContext(ThemeContext);
  const { isVisible, onSelection, children } = props;

  //-----------------States-----------------------------
  const [taskCommands, setTaskCommands] = useState([]);
  const [loader, setLoader] = useState(false);

  //----------------API Calls-----------------------------
  const handleFetchTaskCommands = async () => {
    try {
      setLoader(true);
      const { success, data, error } = await getTaskCommandsGroupedByCategory();
      if (success) {
        setTaskCommands(data.groupedTaskCommands);
      } else {
        console.error("Error fetching task commands:", error);
      }
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      handleFetchTaskCommands();
    }
  }, [isVisible]);

  const handlePromptSelection = (e) => {
    const keys = e.key;
    onSelection({ label: keys });
  };

  const renderIcon = (iconName) => {
    for (const library of iconLibraries) {
      const IconComponent = library[iconName];
      if (IconComponent) {
        return <IconComponent />;
      }
    }
    return <AntDesignIcons.QuestionOutlined />;
  };

  const dropdownStyle = theme === "dark" ? { boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.9), 0 4px 8px rgba(0, 0, 0, 0.4)", } : {};

  return (
    <Dropdown
      open={isVisible}
      dropdownRender={() => (
        <Spin spinning={loader}>
          <Menu
            style={{ maxWidth: DROPDOWN_WIDTH, ...dropdownStyle }}
            onClick={handlePromptSelection}
          >
            {taskCommands.map((categoryGroup, catIdx) => (
              <Menu.ItemGroup
                style={{ width: "100%" }}
                key={`group-${catIdx}`}
                title={categoryGroup.commandsCategoryName}
              >
                {categoryGroup.commands.map((command, cmdIdx) => (
                  <Menu.Item
                    key={command.commands.label}
                    icon={renderIcon(command.commands.icon)}
                  >
                    {command.commands.label}
                  </Menu.Item>
                ))}
              </Menu.ItemGroup>
            ))}
          </Menu>
        </Spin>
      )}
    >
      {children}
    </Dropdown>
  );
};

export default UsefulPromptDropdown;
