import { useState, useEffect } from "react";
import { getConfig, updateConfig } from "../../api/settings";
import "./style.css";
import { Select, message, List, Slider, Input } from "antd";
import TextArea from "antd/es/input/TextArea";
const { Option } = Select;

const DeepseekConfig = ({ isEditing, formState, setFormState }) => {
  const defaultValues = {
    deepseekTemperature: 0,
    deepseekModel: 'DeepSeek-R1',
    deepseekMaxTokens: 16384,
    deepseekTopP: 0,
    deepseekTopK: 1,
    deepseekRepetitionPenalty: 0
  };


  const data = [
    { title: "Model", description: formState?.deepseekModel || "" },
    {
      title: "Reasoning Effort",
      description: formState?.deepseekReasoningEffort || "",
      subtitle: "This setting constrains the effort on reasoning for reasoning models. Reducing the reasoning effort can lead to faster responses and fewer tokens used during reasoning in a response.",
    },
    {
      title: "System Instruction",
      description: formState?.deepseekSystemInstruction || "",
      subtitle: "Enter the system prompt to guide DeepSeek's behavior (e.g., tone, style, or context)."
    },
    {
      title: "Temperature (0 - 2)",
      sliderValue: formState?.deepseekTemperature,
      defaultValue: defaultValues.deepseekTemperature,
      description: formState?.deepseekTemperature || "",
      subtitle: "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic."
    },
    {
      title: "Frequency Penalty (0 - 2)",
      sliderValue: formState?.deepseekRepetitionPenalty,
      defaultValue: defaultValues.deepseekRepetitionPenalty,
      description: formState?.deepseekRepetitionPenalty || "",
      subtitle: "This penalty controls how much new tokens are penalized according to their existing frequency in the text. It decreases the model's likelihood of repeating the same line verbatim.",
    },
    {
      title: "Top P (0 - 1)",
      sliderValue: formState?.deepseekTopP,
      defaultValue: defaultValues.deepseekTopP,
      description: formState?.deepseekTopP || "",
      subtitle: "This is an alternative to sampling with temperature, known as nucleus sampling. Here, the model considers tokens that comprise the top P probability mass. For example, a value of 0.1 implies that only the tokens making up the top 10% of probability mass are considered.",
    },
    {
      title: "Top K (1 - 100)",
      sliderValue: formState?.deepseekTopK,
      defaultValue: defaultValues.deepseekTopK,
      description: formState?.deepseekTopK || "",
      subtitle: "This setting allows sampling only from the top K options for each subsequent token. It is used to eliminate \"long tail\" low-probability responses. The minimum value is 0.",
    },
    {
      title: "Max Tokens",
      defaultValue: defaultValues.deepseekMaxTokens,
      sliderValue: formState?.deepseekMaxTokens,
      description: formState?.deepseekMaxTokens || "",
      subtitle: "This indicates the maximum number of tokens to generate before the process stops.",
    },
  ];


  return (
    <>
      <div className="config-container">
        <List
          size="small"
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <span className="item-title">
                    {item.title === "Prompt Caching" ? '' : (
                      <>
                        {item.title}
                        {item.sliderValue ? (
                          item.defaultValue === Number(item.sliderValue) ?
                            <>: Default</>
                            : <>: {item.sliderValue}</>
                        ) : null}
                      </>
                    )}
                  </span>
                }
                description={
                  item.title === "Model" ? (
                    <Select
                      className="editConfigSelectField config-select field-width"
                      value={formState?.deepseekModel || ""}
                      onChange={(value) =>
                        setFormState({
                          ...formState,
                          deepseekModel: value,
                        })
                      }
                      disabled={!isEditing}
                    >
                      <Option value="deepseek-ai/DeepSeek-R1">
                        DeepSeek-R1
                      </Option>
                      <Option value="deepseek-ai/DeepSeek-V3">
                        DeepSeek-V3
                      </Option>
                    </Select>
                  ) : item.title === "System Instruction" ? (
                    <>
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <TextArea
                        rows={4}
                        type="text"
                        value={formState.deepseekSystemInstruction}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            deepseekSystemInstruction: e.target.value,
                          })
                        }
                        className="field-width"
                      />
                    </>                    
                  ) : item?.title === "Reasoning Effort" ? (
                    <>
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <Select
                        className="editConfigSelectField config-select field-width"
                        value={formState?.deepseekReasoningEffort || "Medium"}
                        onChange={(value) =>
                          setFormState({
                            ...formState,
                            deepseekReasoningEffort: value,
                          })
                        }
                        disabled={true}
                      >
                        <Option value="Low">Low</Option>
                        <Option value="Medium">Medium</Option>
                        <Option value="High">High</Option>
                      </Select>
                    </>
                  ) : item.title === "Temperature (0 - 2)" ? (
                    <>
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={formState?.deepseekTemperature || 0}
                        onChange={(value) =>
                          setFormState({
                            ...formState,
                            deepseekTemperature: value,
                          })
                        }
                        disabled={!isEditing}
                        className="config-slider field-width"
                        marks={{
                          0: { label: <strong className="slider-label-left">Precise</strong> },
                          1: 'Neutral',
                          2: 'Creative'
                        }}
                      />
                    </>
                  ) : item.title === "Max Tokens" ? (
                    <div>
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={16384}
                        value={formState?.deepseekMaxTokens || 0}
                        onChange={(e) => {
                          const value = Math.min(16384, Math.max(0, Number(e.target.value)));
                          setFormState({
                            ...formState,
                            deepseekMaxTokens: value,
                          })
                        }}
                        disabled={!isEditing}
                        className="field-width"
                      />

                    </div>
                  ) : item.title === "Top P (0 - 1)" ? (
                    <>
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        marks={{
                          0: { label: <strong className="slider-label-left">Precise</strong> },
                          0.5: <strong>Balanced</strong>,
                          1: <strong>Creative</strong>
                        }}
                        value={formState?.deepseekTopP || 0}
                        onChange={(value) =>
                          setFormState({
                            ...formState,
                            deepseekTopP: value,
                          })
                        }
                        disabled={!isEditing}
                        className="config-slider field-width"
                      />
                    </>
                  ) : item.title === "Top K (1 - 100)" ? (
                    <>
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        marks={{
                          0: { label: <strong className="slider-label-left">Focused</strong> },
                          50: 'Balanced',
                          100: 'Creative'
                        }}
                        value={formState?.deepseekTopK || 0}
                        onChange={(value) =>
                          setFormState({
                            ...formState,
                            deepseekTopK: value,
                          })
                        }
                        disabled={!isEditing}
                        className="config-slider field-width"
                      />
                    </>
                  ) : item.title === "Frequency Penalty (0 - 2)" ? (
                    <>
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        marks={{
                          0: { label: <strong className="slider-label-left">Balanced</strong> },
                          2: <strong className="slider-label-right">Less Repetition</strong>
                        }}
                        value={formState?.deepseekRepetitionPenalty || 0}
                        onChange={(value) =>
                          setFormState({
                            ...formState,
                            deepseekRepetitionPenalty: value,
                          })
                        }
                        disabled={!isEditing}
                        className="config-slider field-width"
                      />
                    </>
                  ) : (
                    item.description
                  )
                }
              />
            </List.Item>
          )}
        />
      </div>
    </>
  );
};

export default DeepseekConfig;
