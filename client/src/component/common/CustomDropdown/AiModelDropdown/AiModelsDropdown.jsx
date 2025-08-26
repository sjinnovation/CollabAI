import { useState, useContext } from "react"
import { Dropdown, Space, Typography, Tooltip } from "antd"
import { DownOutlined, InfoCircleOutlined, CheckOutlined, RightOutlined } from "@ant-design/icons"
import "./AiModelsDropdown.css";
import { ThemeContext } from "../../../../contexts/themeConfig";
const { Text } = Typography

const AiModelsDropdown = ({ onModelChange }) => {
    const [selectedModel, setSelectedModel] = useState("o3")
    const { theme } = useContext(ThemeContext);

    const models = [
      {
        key: "gpt-4o",
        label: "GPT-4o",
        description: "Great for most tasks",
      },
      {
        key: "gpt-4.5",
        label: "GPT-4.5",
        description: "Good for writing and exploring ideas",
        badge: "RESEARCH PREVIEW",
      },
      {
        key: "o3",
        label: "o3",
        description: "Uses advanced reasoning",
      },
      {
        key: "o4-mini",
        label: "o4-mini",
        description: "Fastest at advanced reasoning",
      },
      {
        key: "o4-mini-high",
        label: "o4-mini-high",
        description: "Great at coding and visual reasoning",
      },
    ]

    const handleMenuClick = (e) => {
      if (e.key !== "more") {
        setSelectedModel(e.key)
        if (onModelChange) {
          onModelChange(e.key)
        }
      }
    }

    const items = [
      ...models.map((model) => ({
        key: model.key,
        label: (
          <div className={`model-item ${theme === "dark" ? "dark-mode" : ""}`}>
            <div>
              <div className="model-name">{model.label}</div>
              <div className="model-description">
                {model.badge && <span className="model-badge">{model.badge}</span>}
                {model.description}
              </div>
            </div>
            {selectedModel === model.key && <CheckOutlined className="check-icon" />}
          </div>
        ),
      })),
      {
        key: "more",
        label: (
          <div className={`more-models ${theme === "dark" ? "dark-mode" : ""}`}>
            <span>More models</span>
            <RightOutlined />
          </div>
        ),
      },
    ]

    const selectedModelData = models.find((model) => model.key === selectedModel)
    return (
      <div className={`dropdown-container ${theme === "dark" ? "dark-mode" : ""}`}>
        <Dropdown
          menu={{ items, onClick: handleMenuClick }}
          trigger={["click"]}
          overlayClassName={`model-dropdown-overlay ${theme === "dark" ? "dark-mode" : ""}`}
        >
          <div className={`dropdown-trigger ${theme === "dark" ? "dark-mode" : ""}`}>
            <Space>
              <div className="dropdown-header">
                <Text className={`dropdown-label ${theme === "dark" ? "dark-mode" : ""}`}>Model</Text>
                <Tooltip title="Information about models">
                  <InfoCircleOutlined className={`info-icon ${theme === "dark" ? "dark-mode" : ""}`} />
                </Tooltip>
              </div>
              <div className={`selected-model ${theme === "dark" ? "dark-mode" : ""}`}>
                <Text className={`model-name ${theme === "dark" ? "dark-mode" : ""}`}>{selectedModelData?.label}</Text>
                <Text className={`model-description ${theme === "dark" ? "dark-mode" : ""}`}>{selectedModelData?.description}</Text>
              </div>
              <DownOutlined className={`dropdown-icon ${theme === "dark" ? "dark-mode" : ""}`} />
            </Space>
          </div>
        </Dropdown>
      </div>
    )
}

export default AiModelsDropdown