import React, { useState, useEffect, useContext } from "react";
import { Menu, Dropdown, Spin } from "antd";
import { ThemeContext } from "../../contexts/themeConfig";
import { PlayCircleOutlined } from "@ant-design/icons";

// constants
const DROPDOWN_WIDTH = 320;

const N8nWorkflowDropdown = (props) => {
  const { theme } = useContext(ThemeContext);
  const { isVisible, onSelection, children, workflows = [], selectedWorkflowIds = [] } = props;

  //-----------------States-----------------------------
  const [loader, setLoader] = useState(false);

  // Filter selected workflows from all workflows
  const selectedWorkflows = workflows.filter(workflow => 
    selectedWorkflowIds.includes(workflow.id)
  );

  const handleWorkflowSelection = (e) => {
    const { item } = e;
    const workflowName = item.props.workflowName;
    onSelection({ label: workflowName });
  };

  const dropdownStyle = theme === "dark" ? { 
    boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.9), 0 4px 8px rgba(0, 0, 0, 0.4)",
    backgroundColor: "#1f1f1f",
    border: "1px solid #434343"
  } : {
    backgroundColor: "#fff",
    border: "1px solid #d9d9d9"
  };

  return (
    <Dropdown
      open={isVisible}
      dropdownRender={() => (
        <Spin spinning={loader}>
          <Menu
            style={{ 
              maxWidth: DROPDOWN_WIDTH, 
              ...dropdownStyle,
              borderRadius: "8px",
              padding: "8px 0"
            }}
            onClick={handleWorkflowSelection}
          >
            {selectedWorkflows.length > 0 ? (
              <Menu.ItemGroup
                style={{ width: "100%" }}
                title="Available Workflows"
              >
                {selectedWorkflows.map((workflow) => (
                  <Menu.Item
                    key={workflow.id}
                    icon={<PlayCircleOutlined style={{ color: "#1890ff" }} />}
                    workflowName={workflow.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%"
                      }}
                    >
                      <strong style={{ fontSize: "14px" }}>{workflow.name}</strong>
                      <small style={{ color: theme === "dark" ? "#8c8c8c" : "#999", fontSize: "12px" }}>
                        ID: {workflow.id}
                      </small>
                    </div>
                  </Menu.Item>
                ))}
              </Menu.ItemGroup>
            ) : (
              <Menu.Item disabled style={{ textAlign: "center", color: theme === "dark" ? "#8c8c8c" : "#999" }}>
                No workflows selected for this assistant
              </Menu.Item>
            )}
          </Menu>
        </Spin>
      )}
    >
      {children}
    </Dropdown>
  );
};

export default N8nWorkflowDropdown; 