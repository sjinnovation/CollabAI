import { useState, useEffect } from "react";
import {
  getConfig,
  updateConfig,
} from "../../api/settings";
import "./style.css"
import { Input, Select, message, List } from "antd";
const { Option } = Select;

const OpenAIConfig = () => {
  const [formState, setFormState] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  
  const getConfigData = async () => {
    try {
      const response = await getConfig();
      if (response) {
        setFormState((prevState) => ({
          ...prevState,
          openaikey: response.openaikey,
          temperature: response.temperature,
          model: response.model,
          openaiMaxToken: response.openaiMaxToken,
          openaiTopP :response.openaiTopP,
          openaiFrequency: response.openaiFrequency,
          openaiPresence :response.openaiPresence
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getConfigData();
  }, []);

  const handleUpdateClick = async () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      const response = await updateConfig(formState);
      if (response) {
        message.success(response.message);
      } else {
        message.error(response.message);
      }
    }
  };

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

  const data = [
    { title: "OpenAI API key", description: formState?.openaikey || "" },
    {
      title: "Temperature (between 0 and 1)",
      description: formState.temperature || "",
    },
    { title: "Model", description: formState?.model || "" },
    { title: "Max Token (up to 4096 tokens)", description: formState?.openaiMaxToken || "" },
    { title: "Top P (between 0 and 1)", description: formState?.openaiTopP || "" },
    { title: "Frequency Penalty (between 0 and 2)", description: formState?.openaiFrequency || "" },
    { title: "Presence Penalty (between 0 and 2)", description: formState?.openaiPresence || "" },
  ];

  return (
    <>
    <div className="scrollable-list">
      <List
        header={<div>Change Settings</div>}
        size="medium"
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.title}
              description={
                isEditing ? (
                  item.title == "OpenAI API key" ? (
                    <Input
                      type="password"
                      value={item.description}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          openaikey: e.target.value,
                        })
                      }
                    />
                  ) : item.title == "Temperature (between 0 and 1)" ? (
                    <Input
                      placeholder="Set Temperature"
                      type="number"
                      name="temperature"
                      className="editConfigInputField"
                      value={formState.temperature || ""}
                      min={0}
                      max={1}
                      step={0.1}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          temperature: e.target.value,
                        })
                      }
                    />
                  ) : item.title == "Model" ? (
                    <Select
                      className="editConfigSelectField"
                      name="model"
                      value={formState?.model || ""}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          model: e,
                        })
                      }
                    >
                      {/* [TODO]: need to improve to have these options being imported from constants */}
                      <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
                      <Option value="gpt-4">GPT-4</Option>
                      <Option value="gpt-4o">GPT-4o</Option>
                    </Select>
                     ) : item.title == "Top P (between 0 and 1)" ? (
                        <Input
                          placeholder="Set openaiTop P"
                          type="number"
                          name="openaiTopP"
                          className="editConfigInputField"
                          value={formState.openaiTopP || ""}
                          min={0}
                          max={1}
                          step={0.1}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              openaiTopP: e.target.value,
                            })
                          }
                        />
                    ) : item.title == "Frequency Penalty (between 0 and 2)" ? (
                        <Input
                          placeholder="Set openaiFrequency"
                          type="number"
                          name="temperature"
                          className="editConfigInputField"
                          value={formState.openaiFrequency || ""}
                          min={0}
                          max={2}
                          step={0.1}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              openaiFrequency: e.target.value,
                            })
                          }
                        />
                    ) : item.title == "Presence Penalty (between 0 and 2)" ? (
                        <Input
                          placeholder="Set openai Presence"
                          type="number"
                          name="openaiPresence"
                          className="editConfigInputField"
                          value={formState.openaiPresence || ""}
                          min={0}
                          max={2}
                          step={0.1}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              openaiPresence: e.target.value,
                            })
                          }
                        />
                    ) : item.title == "Max Token (up to 4096 tokens)" ? (
                        <Input
                          placeholder="Set MaxToken"
                          type="number"
                          name="openaiMaxToken"
                          className="editConfigInputField"
                          value={formState.openaiMaxToken || ""}
                          min={0}
                          max={4096}
                          step={10}
                          onChange={(e) =>
                            setFormState({
                              ...formState,
                              openaiMaxToken: e.target.value,
                            })
                          }
                        />
                  ) : null
                ) : item.title == "OpenAI API key" ? (
                  renderSecretKey()
                ) : (
                  item.description
                )
              }
            />
          </List.Item>
        )}
      />
      <div className="text-end">
        <a
          onClick={handleUpdateClick}
          key="list-loadmore-edit"
          className="btn btn-outline-dark"
        >
          {isEditing ? "update" : "edit"}
        </a>
        {isEditing && (
          <a 
            onClick={() => setIsEditing(!isEditing)} 
            key="list-loadmore-cancel" 
            class="btn btn-outline-dark"
          >
            cancel
          </a>
        )}
      </div>
    </div>
    </>
  );
};

export default OpenAIConfig;
