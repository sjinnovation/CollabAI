import { useContext } from "react";
import { Input, Select, message, List, Slider, Button, Switch } from "antd";
import { ClaudeModels } from "../../constants/setting_constant";
import "./style.css";
import { ThemeContext } from "../../contexts/themeConfig";
import TextArea from "antd/es/input/TextArea";
const { Option } = Select;

const ClaudeAIConfig = ({ formState, setFormState, isEditing }) => {
  const { theme } = useContext(ThemeContext);

  const renderSecretKey = () => {
    const key = formState?.claudeApiKey;
    if (key?.length > 3) {
      const firstThree = key?.slice(0, 3);
      const lastThree = key?.slice(-3);
      const middlePart = key?.slice(3, -3).replace(/./g, "*");
      return firstThree + middlePart + lastThree;
    } else {
      return key;
    }
  };

  const defaultValues = {
    claudeApiKey: "",
    claudeTemperature: 0,
    claudeModel: "claude-3-sonnet-20240229",
    claudeMaxToken: 8192,
    claudeSystemInstruction: "",
    claudeContextLimit: "All",
    claudePromptCaching: false,
  };

  const selectedModel = ClaudeModels.find(
    (m) => m.value === formState.claudeModel
  );
  const claudeMaxTokenCeiling =
    selectedModel?.limit ?? defaultValues.claudeMaxToken;

  const claudeAiData = [
    {
      title: "API key",
      description: formState?.claudeApiKey || "",
    },
    { title: "Choose a Model", description: formState?.claudeModel || "" },
    {
      title: "Reasoning Effort",
      description: formState?.claudeReasoningEffort || "",
      subtitle:
        "This setting constrains the effort on reasoning for reasoning models. Reducing the reasoning effort can lead to faster responses and fewer tokens used during reasoning in a response.",
    },
    {
      title: "System Instruction",
      description: formState?.claudeSystemInstruction || "",
      subtitle:
        "Enter the system prompt to guide Claude's behavior (e.g., tone, style, or context).",
    },
    {
      title: "Context Limit",
      sliderValue: formState?.openaiContextLimit,
      description: formState?.openaiContextLimit || "",
      subtitle:
        "The number of messages to include in the context for the AI assistant. When set to 1, the AI assistant will only see and remember the most recent message.",
    },
    {
      title: "Temperature(0-1)",
      description: formState?.claudeTemperature || "",
      sliderValue: formState?.claudeTemperature,
      defaultValue: defaultValues.claudeTemperature,
      subtitle:
        "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic.",
    },
    {
      title: `Max Token: ${
        formState?.claudeMaxToken || 0
      } (up to ${claudeMaxTokenCeiling})`,
      description: formState?.claudeMaxToken || "",
      sliderValue: formState?.claudeMaxToken,
      defaultValue: defaultValues.claudeMaxToken,
      subtitle:
        "This indicates the maximum number of tokens to generate before the process stops.",
    },
    {
      title: "Prompt Caching",
      description: formState?.claudePromptCaching || "",
      sliderValue: formState?.claudePromptCaching,
      subtitle:
        "Prompt caching helps save token costs for long conversations. Enabling this will incur additional tokens when initiating the cache for the first time, but it can save many more tokens later, especially for long conversations. Not all models support caching, and some models require a minimum number of tokens for caching to be initiated. Please check with your AI model provider for more information.",
    },
  ];

  const onModelChange = (value) => {
    const selected = ClaudeModels.find((m) => m.value === value);
    const ceiling = selected?.limit ?? defaultValues.claudeMaxToken;

    setFormState({
      ...formState,
      claudeModel: value,
      claudeMaxToken: Math.min(formState.claudeMaxToken || 0, ceiling),
    });
  };

  return (
    <div className="config-container">
      <List
        size="medium"
        className="custom-list"
        bordered
        dataSource={claudeAiData}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                <span className="item-title">
                  {item.title === "Prompt Caching" ? (
                    ""
                  ) : (
                    <>
                      {item.title}
                      {item.sliderValue &&
                      !item.title.startsWith("Max Token:") ? (
                        item.defaultValue === Number(item.sliderValue) ? (
                          <>: Default</>
                        ) : (
                          <>: {item.sliderValue}</>
                        )
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
                      className="field-width"
                      value={formState?.claudeApiKey}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          claudeApiKey: e.target.value,
                        })
                      }
                    />
                  ) : (
                    renderSecretKey()
                  )
                ) : item.title === "Reasoning Effort" ? (
                  <>
                    <div className="text-container">
                      <p>{item.subtitle}</p>
                    </div>
                    <Select
                      className="editConfigSelectField field-width"
                      value={formState?.claudeReasoningEffort || "Medium"}
                      onChange={(value) =>
                        setFormState({
                          ...formState,
                          claudeReasoningEffort: value,
                        })
                      }
                      disabled={true}
                    >
                      <Option value="Low">Low</Option>
                      <Option value="Medium">Medium</Option>
                      <Option value="High">High</Option>
                    </Select>
                  </>
                ) : item.title === "Temperature(0-1)" ? (
                  <div>
                    <div className="text-container">
                      <p>{item.subtitle}</p>
                    </div>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={formState?.claudeTemperature || 0}
                      onChange={(value) =>
                        setFormState({
                          ...formState,
                          claudeTemperature: value,
                        })
                      }
                      disabled={!isEditing}
                      className="field-width"
                      marks={{
                        0: {
                          label: (
                            <strong className="slider-label-left">
                              Precise
                            </strong>
                          ),
                        },
                        1: "Neutral",
                        2: "Creative",
                      }}
                    />
                  </div>
                ) : item.title === "Choose a Model" ? (
                  <Select
                    className="editConfigSelectField field-width"
                    name="claudeModel"
                    disabled={!isEditing}
                    value={formState?.claudeModel || ""}
                    onChange={onModelChange}
                  >
                    {ClaudeModels?.map((model, i) => (
                      <Option key={i} value={model.value}>
                        {model.label}
                      </Option>
                    ))}
                  </Select>
                ) : item.title.startsWith("Max Token:") ? (
                  <div>
                    <div className="text-container">
                      <p>{item.subtitle}</p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={claudeMaxTokenCeiling}
                      value={formState?.claudeMaxToken || 0}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        const safe = Math.max(
                          0,
                          Math.min(claudeMaxTokenCeiling, raw)
                        );
                        setFormState({ ...formState, claudeMaxToken: safe });
                      }}
                      disabled={!isEditing}
                      className="field-width"
                    />
                  </div>
                ) : item.title === "System Instruction" ? (
                  <>
                    <div className="text-container">
                      <p>{item.subtitle}</p>
                    </div>
                    <TextArea
                      rows={4}
                      type="text"
                      value={formState.claudeSystemInstruction}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          claudeSystemInstruction: e.target.value,
                        })
                      }
                      className="field-width"
                    />
                  </>
                ) : item.title === "Context Limit" ? (
                  <>
                    <div className="text-container">
                      <p>{item.subtitle}</p>
                    </div>
                    <Select
                      className="editConfigSelectField field-width"
                      name="Context Limit"
                      disabled={true}
                      value={formState?.claudeContextLimit || ""}
                      onChange={(value) =>
                        setFormState({
                          ...formState,
                          claudeContextLimit: value,
                        })
                      }
                    >
                      <Option value="All">All Previous Messages</Option>
                      {[...Array(100)].map((_, index) => (
                        <Option key={index + 1} value={index + 1}>
                          Last {index + 1} message{index !== 0 ? "s" : ""}
                        </Option>
                      ))}
                    </Select>
                  </>
                ) : item.title === "Prompt Caching" ? (
                  <>
                    <div className="prompt-caching">
                      <span
                        className={`prompt-caching-title ${
                          theme === "light" ? "light-theme" : "dark-theme"
                        }`}
                      >
                        {item.title}
                      </span>
                      <Switch
                        checked={formState?.claudePromptCaching}
                        onChange={(checked) =>
                          setFormState({
                            ...formState,
                            claudePromptCaching: checked,
                          })
                        }
                        disabled={true}
                      />
                    </div>
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

export default ClaudeAIConfig;
