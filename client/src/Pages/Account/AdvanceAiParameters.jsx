import { useState, useEffect } from "react";
import "./Usage.css"
import { Form, InputNumber, Button, List, Row, Col, message } from "antd";
import {
  getUserPreferenceConfig,
  updateUserPreferenceConfig,
} from "../../api/userPreference";
import { claudeAdvancedConfigData, geminiAdvancedConfigData, openAIAdvancedConfigData } from "../../constants/user-advanced-ai-parameters";

const AdvanceAiParameters = () => {
  const [form] = Form.useForm();
  const [configData, setConfigData] = useState({}); 
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const getConfigData = async () => {
    try {
      const response = await getUserPreferenceConfig();
      if (response) {
        setConfigData(response);
        form.setFieldsValue(response);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getConfigData();
  }, []);

  const handleUpdateClick = async () => {
    if(!isEditing) {
      setIsEditing(!isEditing);
    }

    if (isEditing) {
      setIsUpdating(true);
      
      try {
        const values = await form.validateFields();

        const response = await updateUserPreferenceConfig(values);
        if (response) {
          setIsEditing(!isEditing);
          message.success(response?.message);
        } else {
          message.error(response?.message);
        }
      } catch (error) {
        console.log("Failed:", error);
      } finally {
        setIsUpdating(false)
      }
    }
  };

  return (
    <>
      <Form form={form} initialValues={configData} layout="vertical">
        <div className="scrollable-list">
          <Row gutter={[0, 20]}>
            <Col span={24}>
              <List
                header={<h5>OpenAI</h5>}
                size="small"
                bordered
                dataSource={openAIAdvancedConfigData}
                renderItem={(item) => (
                  <List.Item>
                    <Form.Item
                      className="p-0 m-0"
                      name={item.name}
                      label={item.label}
                      rules={item.rules}
                    >
                      {isEditing ? (
                        <InputNumber />
                      ) : (
                        <span>{form.getFieldValue(item.name)}</span>
                      )}
                    </Form.Item>
                  </List.Item>
                )}
              />
            </Col>
            <Col span={24}>
              <List
                header={<h5>Gemini</h5>}
                size="small"
                bordered
                dataSource={geminiAdvancedConfigData}
                renderItem={(item) => (
                  <List.Item>
                    <Form.Item
                      className="p-0 m-0"
                      name={item.name}
                      label={item.label}
                      rules={item.rules}
                    >
                       {isEditing ? (
                        <InputNumber className="w-40" />
                      ) : (
                        <span>{form.getFieldValue(item.name)}</span>
                      )}
                    </Form.Item>
                  </List.Item>
                )}
              />
            </Col>

            <Col span={24}>
              <List
                header={<h5>Claude</h5>}
                size="small"
                bordered
                dataSource={claudeAdvancedConfigData}
                renderItem={(item) => (
                  <List.Item>
                    <Form.Item
                      className="p-0 m-0"
                      name={item.name}
                      label={item.label}
                      rules={item.rules}
                    >
                       {isEditing ? (
                        <InputNumber className="w-40" />
                      ) : (
                        <span>{form.getFieldValue(item.name)}</span>
                      )}
                    </Form.Item>
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        </div>
        <div className="text-end">
          <Button loading={isUpdating} disabled={isUpdating} onClick={handleUpdateClick}>
            {isEditing ? "update" : "edit"}
          </Button>
          {isEditing && (
            <Button className="ms-2" danger onClick={() => setIsEditing(!isEditing)}>cancel</Button>
          )}
        </div>
      </Form>
    </>
  );
};

export default AdvanceAiParameters;
