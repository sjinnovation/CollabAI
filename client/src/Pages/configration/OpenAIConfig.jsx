import { useState, useEffect, useContext } from "react";
import {
  getConfig,
  updateConfig,
} from "../../api/settings";
import "./style.css";
import { Input, Select, message, List, Slider, Button, Switch } from "antd";
import ExpandableText from "./ExpandableText";
import TextArea from "antd/es/input/TextArea";
import { ThemeContext } from "../../contexts/themeConfig";
import { updateUserPreferenceConfig } from "../../api/userPreference";
const { Option } = Select;

const OpenAIConfig = ({ formState, setFormState, isEditing }) => {
  const renderSecretKey = () => {
    if (formState?.openaikey?.length > 3) {
      const firstThree = formState?.openaikey?.slice(0, 3);
      const lastThree = formState?.openaikey?.slice(-3);
      const middlePart = formState?.openaikey?.slice(3, -3).replace(/./g, "*");
      return firstThree + middlePart + lastThree;
    } else {
      return formState?.openaikey;
    }
  };

  const defaultValues = {
    temperature: 0,
    model: 'gpt-3.5-turbo',
    openaiMaxToken: 16384,
    openaiTopP: 0,
    openaiFrequency: 0,
    openaiPresence: 0,
    openaiSystemInstruction: '',
    openaiContextLimit: 'All',
    openaiPromptCaching: false
  };


  const data = [
    { title: "API key", description: formState?.openaikey || "" },
    { title: "Choose a Model", description: formState?.model || "" },
    {
      title: "Reasoning Effort",
      description: formState?.openaiReasoningEffort || "",
      subtitle: "This setting constrains the effort on reasoning for reasoning models. Reducing the reasoning effort can lead to faster responses and fewer tokens used during reasoning in a response.",
    },
    {
      title: "System Instruction",
      description: formState?.openaiSystemInstruction || "",
      subtitle:
        "Enter the system prompt to guide OpenAI's behavior (e.g., tone, style, or context).",
    },
    {
      title: "Context Limit",
      sliderValue: <> {formState?.openaiContextLimit}</>,
      description: formState?.openaiContextLimit || "", subtitle: "The number of messages to include in the context for the AI agent. When set to 1, the AI assistant will only see and remember the most recent message."
    },
    {
      title: "Temperature (0-2)",
      description: formState?.temperature || "",
      sliderValue: formState?.temperature,
      defaultValue: defaultValues.temperature,
      subtitle: "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic."
    },
    {
      title: "Presence Penalty (0-2)", description: formState?.openaiPresence || "", sliderValue: formState?.openaiPresence,
      defaultValue: defaultValues.openaiPresence,
      subtitle: "This setting determines how much to penalize new tokens based on their appearance in the text so far. It increases the model's likelihood of discussing new topics."
    },
    {
      title: "Frequency Penalty (0-2)", description: formState?.openaiFrequency || "", sliderValue: formState?.openaiFrequency,
      defaultValue: defaultValues.openaiFrequency,
      subtitle: "This penalty controls how much new tokens are penalized according to their existing frequency in the text. It decreases the model's likelihood of repeating the same line verbatim."
    },
    {
      title: "Top P (0-1)", description: formState?.openaiTopP || "", sliderValue: formState?.openaiTopP,
      defaultValue: defaultValues.openaiTopP,
      subtitle: "This is an alternative to sampling with temperature, known as nucleus sampling. Here, the model considers tokens that comprise the top P probability mass. For example, a value of 0.1 implies that only the tokens making up the top 10% of probability mass are considered."
    },
    {
      title: "Max Token", description: formState?.openaiMaxToken || "",
      sliderValue: formState?.openaiMaxToken,
      defaultValue: defaultValues.openaiMaxToken,
      subtitle: "This indicates the maximum number of tokens to generate before the process stops."
    },
    {
      title: "Prompt Caching", description: formState?.openaiPromptCaching || "", sliderValue: <span>: {formState?.openaiPromptCaching}</span>,
      subtitle: " Prompt caching helps save token costs for long conversations. Enabling this will incur additional tokens when initiating the cache for the first time, but it can save many more tokens later, especially for long conversations. Not all models support caching, and some models require a minimum number of tokens for caching to be initiated. Please check with your AI model provider for more information."
    },
  ];

  return (
    <div className="config-container">
      <List
        className="custom-list"
        size="small"
        bordered
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
                item.title === "API key" ? (
                  isEditing ? (
                    <Input
                      type="password"
                      value={item?.description}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          openaikey: e.target.value,
                        })
                      }
                      className="field-width"
                    />
                  ) : (
                    renderSecretKey()
                  )
                ) :
                  item.title === "System Instruction" ? (
                    <>
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <TextArea
                        rows={4}
                        type="text"
                        value={formState.openaiSystemInstruction}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            openaiSystemInstruction: e.target.value,
                          })
                        }
                        className="field-width"
                      />
                    </>
                  ) : item.title === "Reasoning Effort" ? (
                    <>
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <Select
                        className="editConfigSelectField field-width"
                        value={formState?.openaiReasoningEffort || "Medium"}
                        onChange={(value) =>
                          setFormState({
                            ...formState,
                            openaiReasoningEffort: value,
                          })
                        }
                        disabled={true}
                      >
                        <Option value="Low">Low</Option>
                        <Option value="Medium">Medium</Option>
                        <Option value="High">High</Option>
                      </Select>
                    </>
                  ) : item.title === "Context Limit" ? (
                    <>
                      {/* <ExpandableText text={item.subtitle} maxLines={1} /> */}
                      <div className="text-container">
                        <p>{item.subtitle}</p>
                      </div>
                      <Select
                        className="editConfigSelectField field-width"
                        name="Context Limit"
                        disabled={true}
                        value={formState?.openaiContextLimit || ""}
                        onChange={(value) =>
                          setFormState({
                            ...formState,
                            openaiContextLimit: value,
                          })
                        }
                      >
                        <Option value="All">All Previous Messages</Option>
                        {[...Array(100)].map((_, index) => (
                          <Option key={index + 1} value={index + 1}>
                            Last {index + 1} message{index !== 0 ? 's' : ''}
                          </Option>
                        ))}
                      </Select>
                    </>
                  )
                    : item.title === "Temperature (0-2)" ? (
                      <>
                        {/* <ExpandableText text={item.subtitle} maxLines={1} /> */}
                        <div className="text-container">
                          <p>{item.subtitle}</p>
                        </div>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={formState?.temperature || 0}
                          onChange={(value) =>
                            setFormState({
                              ...formState,
                              temperature: value,
                            })
                          }
                          disabled={!isEditing}
                          className="field-width"
                          marks={{
                            0: { label: <strong className="slider-label-left">Precise</strong> },
                            1: <strong>Neutral</strong>,
                            2: <strong>Creative</strong>
                          }}
                        />
                      </>
                    ) : item.title === "Choose a Model" ? (
                      <Select
                        className="editConfigSelectField field-width"
                        name="model"
                        disabled={!isEditing}
                        value={formState?.model || ""}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            model: e,
                          })
                        }
                      >
                        <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
                        <Option value="gpt-4">GPT-4</Option>
                        <Option value="gpt-4o">GPT-4o</Option>
                        <Option value="gpt-4o-mini">GPT-4o-mini</Option>
                        <Option value="gpt-4.1">gpt-4.1</Option>
                        <Option value="gpt-4.1-mini">gpt-4.1-mini</Option>
                        <Option value="gpt-4.1-nano">gpt-4.1-nano</Option>
                      </Select>
                    ) : item.title === "Top P (0-1)" ? (
                      <>
                        {/* <ExpandableText text={item.subtitle} maxLines={1} /> */}
                        <div className="text-container">
                          <p>{item.subtitle}</p>
                        </div>
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={formState?.openaiTopP || 0}
                          onChange={(value) =>
                            setFormState({
                              ...formState,
                              openaiTopP: value,
                            })
                          }
                          disabled={!isEditing}
                          className="field-width"
                          marks={{
                            0: { label: <strong className="slider-label-left">Precise</strong> },
                            0.5: <strong>Balanced</strong>,
                            1: <strong>Creative</strong>
                          }}
                        />
                      </>
                    ) : item.title === "Frequency Penalty (0-2)" ? (
                      <>
                        {/* <ExpandableText text={item.subtitle} maxLines={1} /> */}
                        <div className="text-container">
                          <p>{item.subtitle}</p>
                        </div>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={formState?.openaiFrequency || 0}
                          onChange={(value) =>
                            setFormState({
                              ...formState,
                              openaiFrequency: value,
                            })
                          }
                          disabled={!isEditing}
                          className="field-width"
                          marks={{
                            0: { label: <strong className="slider-label-left">Balanced</strong> },
                            2: <strong className="slider-label-right">Less Repetition</strong>
                          }}
                        />
                      </>
                    ) : item.title === "Presence Penalty (0-2)" ? (
                      <>
                        {/* <ExpandableText text={item.subtitle} maxLines={1} /> */}
                        <div className="text-container">
                          <p>{item.subtitle}</p>
                        </div>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={formState?.openaiPresence || 0}
                          onChange={(value) =>
                            setFormState({
                              ...formState,
                              openaiPresence: value,
                            })
                          }
                          disabled={!isEditing}
                          className="field-width"
                          marks={{
                            0: { label: <strong className="slider-label-left">Balanced</strong> },
                            2: <strong className="slider-label-right">Open Minded</strong>
                          }}
                        />
                      </>
                    ) : item.title === "Max Token" ? (
                      <>
                        {/* <ExpandableText text={item.subtitle} maxLines={1} /> */}
                        <div className="text-container">
                          <p>{item.subtitle}</p>
                        </div>
                        <Input
                          type="number"
                          disabled={!isEditing}
                          value={formState?.openaiMaxToken || 0}
                          onChange={(e) => {
                            const value = Math.min(16384, Math.max(0, Number(e.target.value)));
                            setFormState({
                              ...formState,
                              openaiMaxToken: value,
                            });
                          }}
                          min={0}
                          max={16384}
                          className="field-width"
                        />
                      </>
                    ) : item.title === "Prompt Caching" ? (
                      <>
                        <div className="prompt-caching">
                          <span className="prompt-caching-title">{item.title}</span>
                          <Switch
                            disabled={!isEditing}
                            checked={formState?.openaiPromptCaching}
                            onChange={(checked) =>
                              setFormState({
                                ...formState,
                                openaiPromptCaching: checked,
                              })
                            }
                            className="prompt-caching-switch"
                          />
                        </div>
                        {/* <ExpandableText text={item.subtitle} maxLines={1} /> */}
                        <div className="text-container">
                          <p>{item.subtitle}</p>
                        </div>
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
  );
};

export default OpenAIConfig;