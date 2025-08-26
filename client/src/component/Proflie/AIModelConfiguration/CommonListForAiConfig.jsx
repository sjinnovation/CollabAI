import {
  Button,
  Dropdown,
  Form,
  Input,
  List,
  Menu,
  Slider,
  Tooltip,
} from "antd";
import React, { useState, useEffect } from "react";
import "./CommonListForAiConfig.scss";
import { DownOutlined } from "@ant-design/icons";
import ReasoningEffortPicker from "../../ChatPage/ReasoningEffortPicker";

const CommonListForAiConfig = ({ configData, isEditing, form, header }) => {
  const [dataValue, setDataValue] = useState({
    openAiTemperature: "",
    openAiPresence_penalty: "",
    openAiFrequency_penalty: "",
    openAiTopP: "",
    openAiMax_tokens: "",
    geminiTemperature: "",
    geminiTopP: "",
    geminiTopK: "",
    geminiMaxOutputTokens: "",
    claudeAiTemperature: "",
    ClaudeAIMaxToken: "",
    deepseekTemperature: "",
    deepseekRepetitionPenalty: "",
    deepseekTopP: "",
    deepseekTopK: "",
    deepseekMaxTokens: "",
  });

  const marks = {
    0: "Precise",
    1: "Neutral",
    2: "Creative",
  };
  const reasoningEffortMenu = (
    <Menu>
      <Menu.Item
        key="low"
        onClick={() => form.setFieldsValue({ reasoningEffort: "Low" })}
      >
        Low
      </Menu.Item>
      <Menu.Item
        key="medium"
        onClick={() => form.setFieldsValue({ reasoningEffort: "Medium" })}
      >
        Medium
      </Menu.Item>
      <Menu.Item
        key="high"
        onClick={() => form.setFieldsValue({ reasoningEffort: "High" })}
      >
        High
      </Menu.Item>
    </Menu>
  );

  const maxTokens = {
    "Max Token (up to 16383 tokens)": 16383,
    "Max Token (up to 8192 tokens)": 8192,
    "Max Token (up to 64000 tokens)": 64000,
    "Max Token (up to 16384 tokens)": 16834,
  };

  const handleMaxTokenChange = (item, value) => {
    const maxValue = maxTokens[item.label];
    if (value > maxValue) {
      form.setFields([
        {
          name: item.name,
          value,
          errors: [`Value cannot exceed ${maxValue}`],
        },
      ]);
    } else {
      form.setFieldsValue({ [item.name]: value });
    }
  };

  return (
    <List
      size="small"
      dataSource={configData}
      renderItem={(item) => {
        const currentValue = form.getFieldValue(item.name) || 0; // Get current value from form

        return (
          <List.Item>
            <List.Item.Meta
              title={
                <div style={{ fontFamily: "DM Sans" }}>
                  {item.label}: {currentValue > 0 ? currentValue : "Default"}
                </div>
              }
              description={
                <>
                  {item.label === "Reasoning Effort (Reasoning models only)" ? (
                    <div>
                      <div
                        style={{
                          fontSize: "smaller",
                          color: "#888",
                          fontFamily: "DM Sans",
                        }}
                      >
                        This setting constrains the effort on reasoning for
                        reasoning models. Reducing the reasoning effort can lead
                        to faster responses and fewer tokens used during
                        reasoning in a response.
                      </div>
                      <Tooltip title="Coming soon" placement="top">
                        <span>
                          <Dropdown overlay={reasoningEffortMenu} disabled>
                            <ReasoningEffortPicker
                              defaultValue="medium"
                              onChange={(val) => {
                                // Handle change
                              }}
                            />
                          </Dropdown>
                        </span>
                      </Tooltip>
                    </div>
                  ) : (
                    <>
                      {item.subtitle && (
                        <div
                          style={{
                            fontSize: "smaller",
                            color: "#888",
                            fontFamily: "DM Sans",
                          }}
                        >
                          {item.subtitle}
                        </div>
                      )}
                      <Form.Item
                        style={{
                          width: "80%",
                          textAlign: "right",
                          marginLeft: "20px",
                        }}
                        className="p-0 m-0"
                        name={item.name}
                        rules={item.rules}
                      >
                        {item.label.includes("Max Token") ? (
                          <Input
                            type="number"
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleMaxTokenChange(item, Number(e.target.value))
                            }
                            value={currentValue} // Use local state for immediate feedback
                            style={{
                              display: "flex",
                              justifyContent: "left",
                              alignItems: "left",
                              marginTop: "5px",
                            }}
                          />
                        ) : item.label === "Top K (1 - 100)" ? (
                          <Slider
                            min={1}
                            max={100}
                            disabled={!isEditing}
                            onChange={(value) => {
                              form.setFieldsValue({ [item.name]: value });
                            }}
                            value={currentValue}
                            marks={{ 1: "1", 100: "100" }}
                          />
                        ) : item.label === "Presence Penalty (0 - 2)" ? (
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            disabled={!isEditing}
                            onChange={(value) => {
                              form.setFieldsValue({ [item.name]: value });
                              setDataValue({
                                ...dataValue,
                                [item.name]: value,
                              });
                            }}
                            value={currentValue}
                            marks={{ 0: "Balanced", 2: "Open Minded" }}
                          />
                        ) : item.label === "Frequency Penalty (0 - 2)" ? (
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            disabled={!isEditing}
                            onChange={(value) => {
                              form.setFieldsValue({ [item.name]: value });
                              setDataValue({
                                ...dataValue,
                                [item.name]: value,
                              });
                            }}
                            value={currentValue}
                            marks={{ 0: "Balanced", 2: "Less Repetition" }}
                          />
                        ) : item.label === "Top P (0 - 1)" ? (
                          <Slider
                            min={0}
                            max={1}
                            step={0.1}
                            disabled={!isEditing}
                            onChange={(value) => {
                              form.setFieldsValue({ [item.name]: value });
                              setDataValue({
                                ...dataValue,
                                [item.name]: value,
                              });
                            }}
                            value={currentValue}
                            marks={{
                              0: "Precise",
                              0.5: "Balanced",
                              1: "Creative",
                            }}
                          />
                        ) : (
                          <Slider
                            min={item.rules[0].min}
                            max={item.rules[0].max}
                            step={item.rules[0].step}
                            disabled={!isEditing}
                            onChange={(value) => {
                              form.setFieldsValue({ [item.name]: value });
                              setDataValue({
                                ...dataValue,
                                [item.name]: value,
                              });
                            }}
                            value={currentValue}
                            marks={{
                              [item.rules[0].min]: "Precise",
                              [item.rules[0].max / 2]: "Neutral",
                              [item.rules[0].max]: "Creative",
                            }}
                          />
                        )}
                      </Form.Item>
                    </>
                  )}
                </>
              }
            />
          </List.Item>
        );
      }}
    />
  );
};

export default CommonListForAiConfig;
