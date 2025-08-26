import React, { useEffect, useState } from 'react'
import ConfigurationHeader from '../../component/Configuration/ConfigurationHeader/ConfigurationHeader';
import { Button, Form, message, Tabs } from 'antd';
import ClaudeAIConfig from './ClaudeAIConfig';
import DeepseekConfig from './DeepseekConfig';
import DalleConfig from './DalleConfig';
import OpenAIConfig from './OpenAIConfig';
import { DallEResolutions } from '../../constants/setting_constant';
import { getConfig, updateConfig } from '../../api/settings';
import VsCodeOpenAIConfig from './vsCodeAIConfigs/OpenAIConfig';
import VsCodeClaudeAIConfig from './vsCodeAIConfigs/VsCodeClaudeAIConfig';

const VsCodeApiConfig = () => {
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
          vsCodeOpenaikey: response.vsCodeOpenaikey,
          vsCodeOpenaiTemperature: response.vsCodeOpenaiTemperature,
          vsCodeOpenaiMaxToken: response.vsCodeOpenaiMaxToken,
        });
        setClaudeFormState({
          vsCodeClaudeApiKey: response.vsCodeClaudeApiKey,
          vsCodeClaudeTemperature: response.vsCodeClaudeTemperature,
          vsCodeClaudeMaxToken: response.vsCodeClaudeMaxToken,
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
            configToUpdate = claudeFormState;
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
        vsCodeOpenaiTemperature: 0,
        vsCodeOpenaiModel: 'gpt-3.5-turbo',
        vsCodeOpenaiMaxToken: 16384,
      },
      '2': {
        ...claudeFormState,
        vsCodeClaudeTemperature: 0,
        vsCodeClaudeModel: 'claude-3-sonnet-20240229',
        vsCodeClaudeMaxToken: 8192,
      }
    };

    const newState = defaultValues[activeTab];

    switch (activeTab) {
      case '1':
        setOpenAIFormState(newState);
        break;
      case '2': setClaudeFormState(newState);
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
      children: <VsCodeOpenAIConfig
        isEditing={isEditing}
        formState={openAIFormState}
        setFormState={setOpenAIFormState}
      />,
    },
    {
      key: '2',
      label: 'Claude',
      children: <VsCodeClaudeAIConfig
        isEditing={isEditing}
        formState={claudeFormState}
        setFormState={setClaudeFormState}
      />,
    },

  ];

  return (
    <div className="advance-ai-parameters-container">
      <ConfigurationHeader title="Vs Code API Configuration" subHeading="Configure advanced parameters for AI models like temperature, tokens, and penalties to fine-tune model responses according to your needs." />
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
  )
}

export default VsCodeApiConfig
