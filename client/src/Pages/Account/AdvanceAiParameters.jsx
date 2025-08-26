import { useState, useEffect } from "react";
import "./Usage.css";
import {
  Form,
  InputNumber,
  Button,
  List,
  Row,
  Col,
  message,
  Slider,
  Tabs,
} from "antd";
import {
  getUserPreferenceConfig,
  updateUserPreferenceConfig,
} from "../../api/userPreference";
import {
  claudeAdvancedConfigData,
  deepseekAdvancedConfigData,
  geminiAdvancedConfigData,
  openAIAdvancedConfigData,
} from "../../constants/user-advanced-ai-parameters";
import CommonListForAiConfig from "../../component/Proflie/AIModelConfiguration/CommonListForAiConfig";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import './AdvanceAiParametersResponsive.css'

const AdvanceAiParameters = () => {
  const [form] = Form.useForm();
  const [configData, setConfigData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

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
    if (!isEditing) {
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
        setIsUpdating(false);
      }
    }
  };

  const handleReset = async () => {
    if (!isEditing) {
      setIsEditing(!isEditing);
    }
    if (isEditing) {
      setIsUpdating(true);

      try {
        const resetConfig = {
          ClaudeAIMaxToken: "",
          claudeAiTemperature: "",
          geminiMaxOutputTokens: "",
          geminiTemperature: "",
          geminiTopK: "",
          geminiTopP: "",
          openAiFrequency_penalty: "",
          openAiMax_tokens: "",
          openAiPresence_penalty: "",
          openAiTemperature: "",
          openAiTopP: "",
          deepseekTemperature: "",
          deepseekMaxTokens: "",
          deepseekTopP: "",
          deepseekTopK: "",
          deepseekRepetitionPenalty: "",
        };

        const response = await updateUserPreferenceConfig(resetConfig);
        if (response) {
          setIsEditing(!isEditing);
          message.success(response?.message);
        } else {
          message.error(response?.message);
        }
      } catch (error) {
        console.log("Failed:", error);
      } finally {
        getConfigData();
        setIsUpdating(false);
      }
    }
  };

  const items = [
    {
      key: "1",
      label: "Open AI",
      children: (
        <CommonListForAiConfig
          configData={openAIAdvancedConfigData}
          isEditing={isEditing}
          form={form}
          header="Open AI"
        />
      ),
    },
    {
      key: "2",
      label: "Gemini",
      children: (
        <CommonListForAiConfig
          configData={geminiAdvancedConfigData}
          isEditing={isEditing}
          form={form}
          header="Gemini"
        />
      ),
    },
    {
      key: "3",
      label: "Claude",
      children: (
        <CommonListForAiConfig
          configData={claudeAdvancedConfigData}
          isEditing={isEditing}
          form={form}
          header="Claude"
        />
      ),
    },
    {
      key: "4",
      label: "DeepSeek",
      children: (
        <CommonListForAiConfig
          configData={deepseekAdvancedConfigData}
          isEditing={isEditing}
          form={form}
          header="DeepSeek"
        />
      ),
    },
  ];

  return (
    <div style={{ height: "100%" }} className="advance-ai-parameters-container">
      <ProfileHeader
        title="AI Model Configuration"
        subHeading="Configure advanced parameters for AI models like temperature, tokens, and penalties to fine-tune model responses according to your needs."
      />
      <div className="text-end position-absolute z-999 account-settings-ai-tabs" style={{ right: "0" }}>
        <Button
          loading={isUpdating}
          disabled={isUpdating}
          onClick={handleUpdateClick}
        >
          {isEditing ? "Update" : "Edit"}
        </Button>
        {isEditing && (
          <>
            <Button className="ms-2" onClick={handleReset}>
              Reset
            </Button>
            <Button
              className="ms-2"
              danger
              onClick={() => setIsEditing(!isEditing)}
            >
              cancel
            </Button>
          </>
        )}
      </div>
      <Form form={form} initialValues={configData} layout="vertical">
        {/* <Tabs defaultActiveKey="1" items={items}
           onChange={() => setIsEditing(false)} 
            /> */}
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setIsEditing(false);
          }}
          items={items}
        />
      </Form>
    </div>
  );
};

export default AdvanceAiParameters;
