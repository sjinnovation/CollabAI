import { useState, useEffect } from "react";
import {
  getConfig,
  updateConfig,
} from "../../api/settings";
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
  ];

  return (
    <>
      <List
        header={<div>Change Settings</div>}
        size="small"
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
                      style={{ width: "290px" }}
                      name="model"
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
                    </Select>
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
    </>
  );
};

export default OpenAIConfig;
