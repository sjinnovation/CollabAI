// src/components/ReasoningEffortPicker.jsx
import React, { useContext, useState } from "react";
import { Button, Popover } from "antd";
import {
  CheckOutlined,
  InfoCircleOutlined,
  DownOutlined,
} from "@ant-design/icons";
import "./ReasoningEffortPicker.css";
import { ThemeContext } from "../../contexts/themeConfig";
import { BiSolidCheckboxChecked } from "react-icons/bi";
import { FaCircleCheck } from "react-icons/fa6";

// Define your three levels once
const OPTIONS = [
  {
    value: "low",
    label: "Low",
    description: "Favors speed and economical reasoning",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balance between speed and reasoning accuracy",
  },
  {
    value: "high",
    label: "High",
    description: "Favors more complete reasoning",
  },
];



export default function ReasoningEffortPicker({
  defaultValue = "medium",
  onChange,
}) {
  const [selected, setSelected] = useState(defaultValue);

  const handleSelect = (val) => {
    setSelected(val);
    onChange?.(val);
  };

  const { theme } = useContext(ThemeContext);

  const content = (
    <div className={`rep-popover ${theme === "dark" && "dark-mode"}`}>
      <div className="rep-header">
        <span>Reasoning Effort</span>
        <InfoCircleOutlined className="rep-info-icon" />
      </div>
      {OPTIONS.map((opt) => {
        const isSel = opt.value === selected;
        return (
          <div
            key={opt.value}
            className={`rep-option ${theme === "dark" && "dark-mode"} ${isSel ? `rep-option-selected ${theme === "dark" && "dark-mode"}` : ""}`}
            onClick={() => handleSelect(opt.value)}
          >
            <div className="rep-option-checked">
              <div className="rep-option-label">{opt.label}</div>
              <div className={`rep-option-desc ${theme === "dark" && "dark-mode"}`}>{opt.description}</div>
            </div>
            {isSel && <FaCircleCheck  className="rep-check" />}
          </div>
        );
      })}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomLeft"
      overlayClassName="rep-popover-wrapper"
    >
      <Button className="rep-button" suffixIcon={<DownOutlined />} disabled>
        {OPTIONS.find((o) => o.value === selected).label}
        <DownOutlined className="rep-down" />
      </Button>
    </Popover>
  );
}
