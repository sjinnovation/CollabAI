import { useContext } from "react";
import { Input, Select, message, List, Slider, Button, Switch } from "antd";
import { ClaudeModels } from "../../../constants/setting_constant";
import "../style.css";
import { ThemeContext } from "../../../contexts/themeConfig";
import TextArea from "antd/es/input/TextArea";
const { Option } = Select;

const VsCodeClaudeAIConfig = ({ formState, setFormState, isEditing }) => {
  const { theme } = useContext(ThemeContext);

  const renderSecretKey = () => {
    const key = formState?.vsCodeClaudeApiKey;
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
    vsCodeClaudeApiKey: "",
    vsCodeClaudeTemperature: 0,
    vsCodeClaudeModel: "claude-3-sonnet-20240229",
    vsCodeClaudeMaxToken: 8192,
  };

  const selectedModel = ClaudeModels.find(
    (m) => m.value === formState.vsCodeClaudeModel
  );
  const claudeMaxTokenCeiling =
    selectedModel?.limit ?? defaultValues.vsCodeClaudeMaxToken;

  const claudeAiData = [
    {
      title: "API key",
      description: formState?.vsCodeClaudeApiKey || "",
    },
    {
      title: "Temperature(0-1)",
      description: formState?.vsCodeClaudeTemperature || "",
      sliderValue: formState?.vsCodeClaudeTemperature,
      defaultValue: defaultValues.vsCodeClaudeTemperature,
      subtitle:
        "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic.",
    },
    {
      title: `Max Token: ${
        formState?.vsCodeClaudeMaxToken || 0
      } (up to ${claudeMaxTokenCeiling})`,
      description: formState?.vsCodeClaudeMaxToken || "",
      sliderValue: formState?.vsCodeClaudeMaxToken,
      defaultValue: defaultValues.vsCodeClaudeMaxToken,
      subtitle:
        "This indicates the maximum number of tokens to generate before the process stops.",
    }
  ];

  const onModelChange = (value) => {
    const selected = ClaudeModels.find((m) => m.value === value);
    const ceiling = selected?.limit ?? defaultValues.vsCodeClaudeMaxToken;

    setFormState({
      ...formState,
      vsCodeClaudeModel: value,
      vsCodeClaudeMaxToken: Math.min(formState.vsCodeClaudeMaxToken || 0, ceiling),
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
                      value={formState?.vsCodeClaudeApiKey}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          vsCodeClaudeApiKey: e.target.value,
                        })
                      }
                    />
                  ) : (
                    renderSecretKey()
                  )
                ) 
                : item.title === "Temperature(0-1)" ? (
                  <div>
                    <div className="text-container">
                      <p>{item.subtitle}</p>
                    </div>
                    <Slider
                      min={0}
                      max={2}
                      step={0.1}
                      value={formState?.vsCodeClaudeTemperature || 0}
                      onChange={(value) =>
                        setFormState({
                          ...formState,
                          vsCodeClaudeTemperature: value,
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
                )
                : item.title.startsWith("Max Token:") ? (
                  <div>
                    <div className="text-container">
                      <p>{item.subtitle}</p>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={claudeMaxTokenCeiling}
                      value={formState?.vsCodeClaudeMaxToken || 0}
                      onChange={(e) => {
                        const raw = Number(e.target.value);
                        const safe = Math.max(
                          0,
                          Math.min(claudeMaxTokenCeiling, raw)
                        );
                        setFormState({ ...formState, vsCodeClaudeMaxToken: safe });
                      }}
                      disabled={!isEditing}
                      className="field-width"
                    />
                  </div>
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

export default VsCodeClaudeAIConfig;
