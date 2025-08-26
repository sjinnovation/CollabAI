import { useState, useEffect } from "react";
import "./style.css"
import { Form, Button, message, Tabs } from "antd";
import {
  getConfig,
  updateConfig,
} from "../../api/settings";
import OpenAIConfig from './OpenAIConfig';
import GeminiConfig from './GeminiAIConfig';
import ClaudeAIConfig from './ClaudeAIConfig';
import DeepseekConfig from './DeepseekConfig';
import DalleConfig from "./DalleConfig";
import { DallEResolutions } from '../../constants/setting_constant';
import ConfigurationHeader from "../../component/Configuration/ConfigurationHeader/ConfigurationHeader";

const AdvanceAiParametersConfig = () => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // State for each AI model
  const [openAIFormState, setOpenAIFormState] = useState({});
  const [geminiFormState, setGeminiFormState] = useState({});
  const [claudeFormState, setClaudeFormState] = useState({});
  const [deepseekFormState, setDeepseekFormState] = useState({});
  const [dallEFormState, setdallEFormState] = useState({});
  const [resolutions, setResolutions] = useState([]);

  const getConfigData = async () => {
    try {
      const response = await getConfig();
      if (response && response.tokens) {
        form.setFieldsValue(response);
        setOpenAIFormState({
            openaikey: response.openaikey,
            temperature: response.temperature,
            model: response.model,
            openaiMaxToken: response.openaiMaxToken,
            openaiTopP: response.openaiTopP,
            openaiFrequency: response.openaiFrequency,
            openaiPresence: response.openaiPresence,
            openaiSystemInstruction: response.openaiSystemInstruction,
            openaiContextLimit: response.openaiContextLimit,
            openaiPromptCaching: response.openaiPromptCaching
        });
        setGeminiFormState({
          geminiApiKey: response.geminiApiKey,
          geminiTemperature: response.geminiTemperature,
          geminiModel: response.geminiModel,
          geminiReasoningEffort: response.geminiReasoningEffort,
          geminiTopK: response.geminiTopK,
          geminiTopP: response.geminiTopP,
          geminiMaxToken: response.geminiMaxToken,
          geminiSystemInstruction: response.geminiSystemInstruction,
          geminiContextLimit: response.geminiContextLimit,
          geminiPromptCaching: response.geminiPromptCaching,
          geminiSafetyHarassment: response.geminiSafetyHarassment,
          geminiSafetyHateSpeech: response.geminiSafetyHateSpeech,
          geminiSafetySexuallyExplicit: response.geminiSafetySexuallyExplicit,
          geminiSafetyDangerous: response.geminiSafetyDangerous,
          geminiSafetyCivicIntegrity: response.geminiSafetyCivicIntegrity
        });
        setClaudeFormState({
          claudeApiKey: response.claudeApiKey,
          claudeTemperature: response.claudeTemperature,
          claudeModel: response.claudeModel,
          claudeMaxToken: response.claudeMaxToken,
          claudeSystemInstruction: response.claudeSystemInstruction,
          claudeContextLimit: response.claudeContextLimit,
          claudePromptCaching: response.claudePromptCaching
        });
        setDeepseekFormState({
          deepseekTemperature: response.deepseekTemperature,
          deepseekModel: response.deepseekModel,
          deepseekMaxTokens: response.deepseekMaxTokens,
          deepseekTopP: response.deepseekTopP,
          deepseekTopK: response.deepseekTopK,
          deepseekRepetitionPenalty: response.deepseekRepetitionPenalty,
          deepseekSystemInstruction: response.deepseekSystemInstruction || '',
        });
        setdallEFormState({
          dallEModel: response.dallEModel,
          dallEQuality: response.dallEQuality,
          dallEResolution: response.dallEResolution,
        });
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    getConfigData();
  }, []);

  const handleUpdateClick = async () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setIsUpdating(true);
      try {
        let configToUpdate;
        switch (activeTab) {
          case '1':
          configToUpdate = openAIFormState;
          break;
          case '2':
          configToUpdate = geminiFormState;
          break;
          case '3':
          configToUpdate = claudeFormState;
          break;
          case '4':
          configToUpdate = deepseekFormState;
          break;
          case '5':
          configToUpdate = dallEFormState;
          break;
          default:
          break;
        }

        if (!configToUpdate) {
          message.error("No configuration to update");
          setIsUpdating(false);
          return;
        }

        const response = await updateConfig(configToUpdate);
        if (response) {
          message.success(`${items?.find(item => item?.key === activeTab)?.label} configuration updated successfully`);
        } else {
          message.error("Failed to update configuration");
        }
      } catch (error) {
        message.error("Failed to update configuration");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleReset = async () => {
    const defaultValues = {
      '1': {
        ...openAIFormState,
        temperature: 0,
        model: 'gpt-3.5-turbo',
        openaiMaxToken: 16384,
        openaiTopP: 0,
        openaiFrequency: 0,
        openaiPresence: 0,
        openaiSystemInstruction: '',
        openaiContextLimit: 'All',
        openaiPromptCaching: false
      },
      '2': {
        ...geminiFormState,
        geminiTemperature: 0,
        geminiModel: 'gemini-pro',
        geminiReasoningEffort: 'Medium',
        geminiTopK: 1,
        geminiTopP: 0,
        geminiMaxToken: 2048,
        geminiSystemInstruction: '',
        geminiContextLimit: 'All',
        geminiPromptCaching: false,
        geminiSafetyHarassment: 0,
        geminiSafetyHateSpeech: 0,
        geminiSafetySexuallyExplicit: 0,
        geminiSafetyDangerous: 0,
        geminiSafetyCivicIntegrity: 0
      },
      '3': {
        ...claudeFormState,
        claudeTemperature: 0,
        claudeModel: 'claude-3-sonnet-20240229',
        claudeMaxToken: 8192,
        claudeSystemInstruction: '',
        claudeContextLimit: 'All',
        claudePromptCaching: false
      },
      '4': {
        ...deepseekFormState,
        deepseekTemperature: 0,
        deepseekModel: 'DeepSeek-R1',
        deepseekMaxTokens: 16384,
        deepseekTopP: 0,
        deepseekTopK: 1,
        deepseekRepetitionPenalty: 0
      },
      '5': {
        ...dallEFormState,
        dallEModel: 'dall-e-3',
        dallEQuality: 'Standard',
        dallEResolution: '1024x1024',
      }
    };

    const newState = defaultValues[activeTab];

    switch (activeTab) {
      case '1':
      setOpenAIFormState(newState);
      break;
      case '2':
      setGeminiFormState(newState);
      break;
      case '3': setClaudeFormState(newState);
      break;
      case '4': setDeepseekFormState(newState);
      break;
      case '5': setdallEFormState(newState);
      break;
      default: break;
    }

    try {
      const response = await updateConfig(newState);
      if (response) {
        setIsEditing(false);
        message.success(`${items.find(item => item.key === activeTab).label} configuration reset successfully`);
      } else {
        message.error("Failed to reset configuration");
      }
    } catch (error) {
      message.error("Failed to reset configuration");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModelChange = (value) => {
    setdallEFormState({
      ...dallEFormState,
      dallEModel: value,
      dallEResolution: "",
    });
    setResolutions(DallEResolutions[value] || []);
  };

  const items = [
    {
      key: '1',
      label: 'Open AI',
      children: <OpenAIConfig
        isEditing={isEditing}
        formState={openAIFormState}
        setFormState={setOpenAIFormState}
      />,
    },
    {
      key: '2',
      label: 'Gemini',
      children: <GeminiConfig
        isEditing={isEditing}
        formState={geminiFormState}
        setFormState={setGeminiFormState}
      />,
    },
    {
      key: '3',
      label: 'Claude',
      children: <ClaudeAIConfig
        isEditing={isEditing}
        formState={claudeFormState}
        setFormState={setClaudeFormState}
      />,
    },
    {
      key: '4',
      label: 'DeepSeek',
      children: <DeepseekConfig
        isEditing={isEditing}
        formState={deepseekFormState}
        setFormState={setDeepseekFormState}
      />,
    },
    {
      key: '5',
      label: 'Dall-E',
      children: <DalleConfig
        isEditing={isEditing}
        formState={dallEFormState}
        setFormState={setdallEFormState}
        handleModelChange={handleModelChange}
        resolutions={resolutions}
      />,
    },
  ];

  return (
    <div className="advance-ai-parameters-container">
      <ConfigurationHeader title="AI Model Configuration" subHeading="Configure advanced parameters for AI models like temperature, tokens, and penalties to fine-tune model responses according to your needs." />
      <div className="text-end position-absolute z-999 advance-config-tab">
        <Button loading={isUpdating} disabled={isUpdating} onClick={handleUpdateClick}>
          {isEditing ? "Update" : "Edit"}
        </Button>
        {isEditing && (
          <>
            <Button className="ms-2" onClick={handleReset}>Reset</Button>
            <Button className="ms-2" danger onClick={() => setIsEditing(!isEditing)}>Cancel</Button>
          </>
        )}
      </div>
      <Form form={form} layout="vertical">
        <Tabs
          defaultActiveKey="1"
          items={items}
          onChange={(key) => {
            setActiveTab(key)
            setIsEditing(false);
          }}
        />
      </Form>
    </div>
  );
};

export default AdvanceAiParametersConfig;