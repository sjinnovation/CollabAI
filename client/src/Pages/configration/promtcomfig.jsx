import { useState, useEffect } from "react";
import {
  getConfig,
  updateModel,
  updateOpenAIKey,
  updateTemperature,
} from "../../api/settings";
import { Form, Input, Button, Select, message, List, Modal } from "antd";
const { confirm } = Modal;
const { Option } = Select;

const Configration = () => {
  const [formState, setFormState] = useState({});
  const [tempState, setTempState] = useState({});
  const [isEditing, setIsEditing] = useState();

  const getConfigData = async () => {
    try {
      const response = await getConfig();
      if (response) {
        setFormState((prevState) => ({
          ...prevState,
          secretKey: response.key,
          temperature: response.temp,
          aiModel: response.model,
        }));
        setTempState((prevState) => ({
          ...prevState,
          secretKey: response.key,
          temperature: response.temp,
          aiModel: response.model,
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getConfigData();
  }, []);

  const handleUpdateClick = async (fieldName) => {
    if (fieldName) {
      try {
        switch (fieldName) {
          case "secretKey":
            var res = await updateOpenAIKey(formState.secretKey);
            if (res.status == 200) {
              message.success("Key Updated");
            } else {
              message.error("Something went wrong");
            }
            break;
          case "temperature":
            const temperature = parseFloat(formState[fieldName]);
            if (isNaN(temperature) || temperature < 0 || temperature > 1) {
              message.error(
                "Temperature must be a decimal number range between 0 and 1"
              );
              throw new Error(
                "Temperature must be a decimal number range between 0 and 1"
              );
            }
            var res = await updateTemperature(formState.temperature);
            if (res.status == 200) {
              message.success("Temperature Updated");
            } else {
              message.error("Something went wrong");
            }
            break;
          case "aiModel":
            confirm({
              title: 'Are you sure you want to change GPT Model?',
              // icon: <ExclamationCircleFilled />,
              async onOk() {
                try {
                  const res = await updateModel(formState.aiModel);
                  if (res.status === 200) {
                    getConfigData();
                    message.success("Model Updated");
                  } else {
                    message.error("Something went wrong");
                  }
                } catch (error) {
                  console.error("Error updating model:", error);
                  message.error("Failed to update model");
                }
              },
              onCancel() {},
            });

            break;
          default:
            console.log(`No API found for field ${fieldName}`);
        }
      } catch (error) {
        console.error(`Error calling API for field ${fieldName}: ${error}`);
        return;
      }
    }
  };

  const setEditing = async (field) => {
    if (isEditing == field) {
      if (
        field == "OpenAI API key" &&
        formState.secretKey != tempState.secretKey
      ) {
        await handleUpdateClick("secretKey");
        setIsEditing(null);
        getConfigData();
      } else if (
        field == "Temperature (between 0 and 1)" &&
        formState.temperature != tempState.temperature
      ) {
        await handleUpdateClick("temperature");
        setIsEditing(null);
        getConfigData();
      } else if (field == "Model" && formState.aiModel != tempState.aiModel) {
        await handleUpdateClick("aiModel");
        setIsEditing(null);
        getConfigData();
      }
    } else {
      setIsEditing(field);
    }
  };

  const renderSecretKey = () => {
    if (formState?.secretKey?.length > 3) {
      const firstThree = formState?.secretKey?.slice(0, 3);
      const lastThree = formState?.secretKey?.slice(-3);
      const middlePart = formState?.secretKey?.slice(3, -3).replace(/./g, "*");
      return firstThree + middlePart + lastThree;
    } else {
      return formState?.secretKey;
    }
  };

  const data = [
    { title: "OpenAI API key", description: formState?.secretKey || "" },
    {
      title: "Temperature (between 0 and 1)",
      description: formState.temperature || "",
    },
    { title: "Model", description: formState?.aiModel || "" },
  ];

  const handleCancel = () => {
    setFormState({ ...tempState });
    setIsEditing(null);
  };

  return (
    <div className="m-5">
      <List
        header={<div>Change Settings</div>}
        size="small"
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            actions={[
              <a
                onClick={() => setEditing(item.title)}
                key="list-loadmore-edit"
              >
                {isEditing == item.title ? "update" : "edit"}
              </a>,
              isEditing == item.title && (
                <a onClick={handleCancel} key="list-loadmore-edit">
                  cancel
                </a>
              ),
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={
                isEditing == item.title ? (
                  item.title == "OpenAI API key" ? (
                    <Input
                      type="password"
                      value={item.description}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          secretKey: e.target.value,
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
                      name="aiModel"
                      value={formState?.aiModel || ""}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          aiModel: e,
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
    </div>
  );
};

export default Configration;
