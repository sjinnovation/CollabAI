import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Alert, 
  Form, 
  Switch, 
  InputNumber, 
  Select, 
  Button, 
  Row, 
  Col, 
  Tooltip,
  message,
  Divider,
  Input,
  Spin,
  Modal
} from 'antd';
import { 
  SettingOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  DatabaseOutlined, 
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { 
  getAISuggestionSettings, 
  updateAISuggestionSettings, 
  getAISuggestionBatchProcessing, 
  runAISuggestionBatchProcessing 
} from '../../../api/aiSuggestionApiFunctions';
import CronScheduler from '../../../component/common/CronScheduler';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AiSuggestionSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCronModalVisible, setIsCronModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  
  // Form state - initialized with defaults
  const [enableAISuggestions, setEnableAISuggestions] = useState(false);
  const [promptsPerUser, setPromptsPerUser] = useState(5);
  const [maxFeaturedAgents, setMaxFeaturedAgents] = useState(5);
  const [cronTime, setCronTime] = useState("0 0 * * *");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState("You are an AI assistant that helps users find relevant assistants based on their needs.");
  const [exampleResults, setExampleResults] = useState(["", "", "", ""]);
  const [userPrompt, setUserPrompt] = useState("Please provide a brief description of your needs or the task you want assistance with.");
  const [maxTokensPerUser, setMaxTokensPerUser] = useState(1000);
  const [batchSize, setBatchSize] = useState(10);
  const [dataRetention, setDataRetention] = useState(30);
  
  // Batch processing state
  const [batchProcessingData, setBatchProcessingData] = useState([]);
  const [lastBatchRunId, setLastBatchRunId] = useState(null);
  // Status data (derived from API data)
  const statusData = {
    status: batchProcessingData?.data  ? batchProcessingData.data?.status || "Completed" : "Not Started",
    startTime: batchProcessingData?.data ? new Date(batchProcessingData.data?.startTime || batchProcessingData.data?.createdAt).toLocaleString() : "Never",
    endTime: batchProcessingData?.data ? new Date(batchProcessingData.data?.endTime || batchProcessingData.data?.updatedAt).toLocaleString() : "N/A",
    processedUsers: batchProcessingData.data?.totalUsers || 0,
    successes: batchProcessingData.data?.processedUsers || 0,
    failures: batchProcessingData.data?.status === "completed" ? (batchProcessingData.data?.totalUsers || 0) - (batchProcessingData.data?.processedUsers || 0) : 0,
    successRate: Math.round((batchProcessingData.data?.processedUsers / (batchProcessingData.data?.totalUsers || 1)) * 100), // Placeholder, calculate based on actual data
    nextRun: "Next scheduled run"
  };

  // Budget warning (calculated from settings)
  const budgetWarning = {
    show: maxTokensPerUser * batchSize > 50000, // Example threshold
    percentage: Math.min(100, Math.round((maxTokensPerUser * batchSize / 50000) * 100)),
    message: `Approaching batch/token budget: ${Math.min(100, Math.round((maxTokensPerUser * batchSize / 50000) * 100))}% of estimated max for this cycle.`
  };

  const models = [
    { value: "gpt-4o-mini", label: "GPT-4o Mini", desc: "Fast, cost-effective" },
    { value: "gpt-4o", label: "GPT-4o", desc: "High quality, balanced speed" },
    { value: "gpt-4-turbo-preview", label: "GPT-4 Turbo", desc: "Most capable, slower" }
  ];



  const handleInputChange = (setter) => (value) => {
    setter(value);
    setHasChanges(true);
  };

  const handleExampleChange = (idx, value) => {
    setExampleResults((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
    setHasChanges(true);
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load settings
        const settingsResult = await getAISuggestionSettings(
          (settings) => {
            if (settings) {
              setEnableAISuggestions(settings.settings.enableAISuggestion || false);
              setPromptsPerUser(settings.settings.promptPerUser || 5);
              setMaxFeaturedAgents(settings.settings.maxFeaturedAgents || 5);
              setCronTime(settings.settings.cronTime || "0 0 * * *");
              setSelectedModel(settings.settings.openAIBatchModel || "gpt-4o-mini");
              setSystemPrompt(settings.settings.batchModelSystemPrompt || "You are an AI assistant that helps users find relevant assistants based on their needs.");
              setUserPrompt(settings.settings.batchModelUserPrompt || "Please provide a brief description of your needs or the task you want assistance with.");
              setMaxTokensPerUser(settings.settings.maxTokenPerUserForProcessing || 1000);
              setBatchSize(settings.settings.batchSize || 10);
              setDataRetention(settings.settings.dataRetentionPeriod || 30);
              setLastBatchRunId(settings.settings.lastBatchRunId || null);
              // Set examples if present, else fallback to 4 empty fields
              if (Array.isArray(settings.settings.batchModelExamples)) {
                setExampleResults([
                  ...settings.settings.batchModelExamples,
                  ...Array(4 - settings.settings.batchModelExamples.length).fill("")
                ].slice(0, 4));
              } else {
                setExampleResults(["", "", "", ""]);
              }
            }
          },
          setIsInitialLoading
        );

        // Load batch processing data
        await getAISuggestionBatchProcessing(setBatchProcessingData, setIsInitialLoading);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
  }, []);

  const handleSave = async () => {
    // Concatenate examples to systemPrompt if any are filled
    let fullSystemPrompt = systemPrompt;
    const nonEmptyExamples = exampleResults.filter(e => e.trim() !== "");
    if (nonEmptyExamples.length > 0) {
      fullSystemPrompt += "\n\nExample Results:";
      nonEmptyExamples.forEach((ex, idx) => {
        fullSystemPrompt += `\n${idx + 1}. ${ex}`;
      });
    }
    const settingsData = {
      enableAISuggestion: enableAISuggestions,
      promptPerUser: promptsPerUser,
      maxFeaturedAgents: maxFeaturedAgents,
      cronTime: cronTime,
      openAIBatchModel: selectedModel,
      batchModelSystemPrompt: systemPrompt, // Only the prompt, not examples
      batchModelExamples: exampleResults,   // Send examples separately
      batchModelUserPrompt: userPrompt,
      maxTokenPerUserForProcessing: maxTokensPerUser,
      batchSize: batchSize,
      dataRetentionPeriod: dataRetention
    };

    const result = await updateAISuggestionSettings(
      settingsData,
      setIsLoading,
      (updatedSettings) => {
        setHasChanges(false);
        // Update local state with the response
        if (updatedSettings) {
          setEnableAISuggestions(updatedSettings.enableAISuggestion || false);
          setPromptsPerUser(updatedSettings.promptPerUser || 5);
          setMaxFeaturedAgents(updatedSettings.maxFeaturedAgents || 5);
          setCronTime(updatedSettings.cronTime || "0 0 * * *");
          setSelectedModel(updatedSettings.openAIBatchModel || "gpt-4o-mini");
          setSystemPrompt(updatedSettings.batchModelSystemPrompt || "You are an AI assistant that helps users find relevant assistants based on their needs.");
          setUserPrompt(updatedSettings.batchModelUserPrompt || "Please provide a brief description of your needs or the task you want assistance with.");
          setMaxTokensPerUser(updatedSettings.maxTokenPerUserForProcessing || 1000);
          setBatchSize(updatedSettings.batchSize || 10);
          setDataRetention(updatedSettings.dataRetentionPeriod || 30);
        }
      }
    );

    if (!result.success) {
      message.error("Failed to save settings. Please try again.");
    }
  };

  const handleRunBatch = async () => {
    const result = await runAISuggestionBatchProcessing(
      setIsRunningBatch,
      (batchData) => {
        // Refresh batch processing data after running
        getAISuggestionBatchProcessing(setBatchProcessingData, () => {});
      }
    );

    if (!result.success) {
      message.error(result?.error?.response?.data?.message || "Failed to start batch processing. Please try again.");
    }
  };

  const getErrorDetails = () => {
    if (!batchProcessingData?.data?.error || !Array.isArray(batchProcessingData.data.error)) {
      return [];
    }
    
    return batchProcessingData.data.error
      .filter(error => {
        // Consider as error if:
        // 1. Has a response with status_code >= 400 (error status codes)
        // 2. Has error details in body.error
        const statusCode = error?.response?.status_code;
        const hasErrorBody = error?.response?.body?.error;
        
        return statusCode >= 400 && hasErrorBody;
      })
      .map((error, index) => {
        const errorMessage = error?.response?.body?.error?.message || "Unknown error";
        const errorType = error?.response?.body?.error?.type || "unknown_error";
        const errorCode = error?.response?.body?.error?.code || "unknown_code";
        const statusCode = error?.response?.status_code || "N/A";
        const customId = error?.custom_id || "Unknown User";
        const requestId = error?.response?.request_id || "N/A";
        
        return {
          id: index,
          message: errorMessage,
          type: errorType,
          code: errorCode,
          statusCode: statusCode,
          customId: customId,
          requestId: requestId,
          fullError: error
        };
      });
  };

  const getStatusIcon = () => {
    switch (statusData.status) {
      case "Completed":
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />;
      case "In Progress":
        return <PlayCircleOutlined style={{ color: '#1890ff', fontSize: '16px' }} />;
      case "Failed":
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />;
      default:
        return <SettingOutlined style={{ color: '#8c8c8c', fontSize: '16px' }} />;
    }
  };

  if (isInitialLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div><Spin tip="Loading AI Suggestion Settings..." size="large" /></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>AI Suggestions Agent: Admin Setup</Title>
      </div>

      {/* Budget Warning */}
      {budgetWarning.show && (
        <Alert
          message={budgetWarning.message}
          description="Consider lowering prompts/agents/user or increasing batch interval."
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={24}>
        {/* Main Settings */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Primary Toggle */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Title level={5} style={{ margin: 0 }}>Enable AI Suggestions (batch agent)</Title>
                </div>
                <Switch
                  checked={enableAISuggestions}
                  onChange={handleInputChange(setEnableAISuggestions)}
                  size="large"
                />
              </div>
            </Card>

            {/* Core Configuration */}
            <Card
              title={
                <span>
                  <UserOutlined style={{ marginRight: '8px' }} />
                  User Analysis Configuration
                </span>
              }
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label={
                    <span>
                      Number of Prompts per User
                      <Tooltip title="How many historical prompts to analyze per user">
                        <QuestionCircleOutlined style={{ marginLeft: '4px', color: '#8c8c8c' }} />
                      </Tooltip>
                    </span>
                  }>
                    <InputNumber
                      min={1}
                      max={100}
                      value={promptsPerUser}
                      onChange={handleInputChange(setPromptsPerUser)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label={
                    <span>
                      Max Featured Agents Suggested
                      <Tooltip title="Maximum number of agents (from Featured list) to recommend in user suggestions">
                        <QuestionCircleOutlined style={{ marginLeft: '4px', color: '#8c8c8c' }} />
                      </Tooltip>
                    </span>
                  }>
                    <InputNumber
                      min={1}
                      max={10000}
                      value={maxFeaturedAgents}
                      onChange={handleInputChange(setMaxFeaturedAgents)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Scheduling */}
            <Card
              title={
                <span>
                  <ClockCircleOutlined style={{ marginRight: '8px' }} />
                  Scheduling Configuration
                </span>
              }
            >
              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item label={
                    <span>
                      Cron Schedule
                      <Tooltip title="Configure when the batch processing should run">
                        <QuestionCircleOutlined style={{ marginLeft: '4px', color: '#8c8c8c' }} />
                      </Tooltip>
                    </span>
                  }>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Input
                        value={cronTime}
                        readOnly
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                        placeholder="0 0 * * *"
                      />
                      <Button
                        type="primary"
                        onClick={() => setIsCronModalVisible(true)}
                      >
                        Configure Schedule
                      </Button>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                      Click to configure when the batch processing should run
                    </Text>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Model & Prompt Configuration */}
            <Card
              title={
                <span>
                  <DatabaseOutlined style={{ marginRight: '8px' }} />
                  AI Model Configuration
                </span>
              }
            >
              <Form.Item label="OpenAI Model">
                <Select 
                  value={selectedModel} 
                  onChange={handleInputChange(setSelectedModel)}
                  style={{ width: '100%' }}
                >
                  {models.map((model) => (
                    <Option key={model.value} value={model.value}>
                      <div>
                        <div>{model.label}</div>
                        {/* <Text type="secondary" style={{ fontSize: '12px' }}>{model.desc}</Text> */}
                      </div>
                    </Option>
                  ))}
                </Select>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Select model for batch processing (controls speed/cost/quality)
                </Text>
              </Form.Item>
              <Form.Item label="System Prompt">
                <TextArea
                  value={systemPrompt}
                  onChange={(e) => handleInputChange(setSystemPrompt)(e.target.value)}
                  rows={4}
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  placeholder="Edit the persona/prompt instructions for the LLM batch"
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Admin-editable instructions for OpenAI batch prompts
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Text strong>Example of Suggestions:</Text>
                  {exampleResults.map((ex, idx) => (
                    <TextArea
                      key={idx}
                      value={ex}
                      onChange={e => handleExampleChange(idx, e.target.value)}
                      placeholder={`Example result ${idx + 1}`}
                      style={{ marginTop: 6, fontFamily: 'monospace', fontSize: '12px' }}
                      autoSize={{ minRows: 1, maxRows: 20 }}
                    />
                  ))}
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    These examples will be appended to the system prompt when saving.
                  </Text>
                  <div style={{ marginTop: 16 }}>
                    <Text strong>Response Example (JSON):</Text>
                    <TextArea
                      value={(() => {
                        const nonEmpty = exampleResults.filter(e => e.trim() !== "");
                        if (nonEmpty.length === 0) return "[{\"suggestions\": []}]";
                        return JSON.stringify([{ suggestions: nonEmpty }], null, 2);
                      })()}
                      rows={3}
                      style={{ fontFamily: 'monospace', fontSize: '12px', marginTop: 4 }}
                      disabled
                    />
                  </div>
                </div>
              </Form.Item>

            </Card>

            {/* Processing Limits */}
            <Card
              title={
                <span>
                  <SettingOutlined style={{ marginRight: '8px' }} />
                  Processing Limits
                </span>
              }
            >
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label={
                    <span>
                      Max Tokens per User
                      <Tooltip title="Token budget for analyzing and generating suggestions per user">
                        <QuestionCircleOutlined style={{ marginLeft: '4px', color: '#8c8c8c' }} />
                      </Tooltip>
                    </span>
                  }>
                    <InputNumber
                      min={100}
                      max={10000}
                      value={maxTokensPerUser}
                      onChange={handleInputChange(setMaxTokensPerUser)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={
                    <span>
                      Batch Size
                      <Tooltip title="How many users to process per batch run">
                        <QuestionCircleOutlined style={{ marginLeft: '4px', color: '#8c8c8c' }} />
                      </Tooltip>
                    </span>
                  }>
                    <InputNumber
                      min={1}
                      max={1000}
                      value={batchSize}
                      onChange={handleInputChange(setBatchSize)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label={
                    <span>
                      Data Retention (days)
                      <Tooltip title="How long to retain AI usage data and suggestions in storage">
                        <QuestionCircleOutlined style={{ marginLeft: '4px', color: '#8c8c8c' }} />
                      </Tooltip>
                    </span>
                  }>
                    <InputNumber
                      min={1}
                      max={365}
                      value={dataRetention}
                      onChange={handleInputChange(setDataRetention)}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Save Settings Button */}
            <Card>
            <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  onClick={handleSave}
                  disabled={!hasChanges || isLoading}
                  size="large"
                  style={{ minWidth: '100%' }}
                  loading={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </Card>
          </Space>
        </Col>

        {/* Status Panel */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Manual Run */}
            <Card>
              <Button
                type="primary"
                onClick={handleRunBatch}
                disabled={isRunningBatch || !enableAISuggestions}
                icon={<PlayCircleOutlined />}
                size="large"
                style={{ width: '100%' }}
                loading={isRunningBatch}
              >
                {isRunningBatch ? "Running Batch..." : "Run Batch Now"}
              </Button>
            </Card>

            {/* Status Card */}
            <Card
              title={
                <span>
                  {getStatusIcon()}
                  <span style={{ marginLeft: '8px' }}>
                   Batch Processing Details • Last Batch Run
                  </span>
                </span>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Processed Users:</Text>
                  <Text strong>{statusData.processedUsers}</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Success:</Text>
                  <Text strong style={{ color: '#52c41a' }}>{statusData.successes}</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Failures:</Text>
                  <div>
                    <Text strong style={{ color: '#ff4d4f' }}>{statusData.failures}</Text>
                    {statusData.failures > 0 && (
                      <Button 
                        type="link" 
                        size="small" 
                        style={{ padding: 0, height: 'auto', color: '#ff4d4f' }}
                        onClick={() => setIsErrorModalVisible(true)}
                      >
                        View error details
                      </Button>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Last Run:</Text>
                  <Text strong style={{ fontSize: '12px' }}>{statusData.startTime}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Batch Completed At:</Text>
                  <Text strong style={{ fontSize: '12px' }}>{statusData.endTime}</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Batch Success Rate:</Text>
                  <Text strong style={{ color: '#1890ff' }}>{statusData.successRate}%</Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Cron Scheduler Modal */}
      <Modal
        title={
          <span>
            <ClockCircleOutlined style={{ marginRight: '8px' }} />
            Configure Cron Schedule
          </span>
        }
        open={isCronModalVisible}
        onCancel={() => setIsCronModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsCronModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="apply" 
            type="primary" 
            onClick={() => {
              setIsCronModalVisible(false);
              setHasChanges(true);
            }}
          >
            Apply Schedule
          </Button>
        ]}
        width={1200}
        destroyOnClose
      >
        <CronScheduler
          value={cronTime}
          onChange={(newCronTime) => handleInputChange(setCronTime)(newCronTime)}
        />
      </Modal>

      {/* Error Details Modal */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
            Batch Processing Errors
          </span>
        }
        open={isErrorModalVisible}
        onCancel={() => setIsErrorModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsErrorModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
        destroyOnClose
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {getErrorDetails()?.length > 0 ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {getErrorDetails().map((error) => (
                <Alert
                  key={error.id}
                  message={`Error for User: ${error.customId}`}
                  description={
                    <div>
                      <div><strong>Error Message:</strong> {error.message}</div>
                      <div><strong>Error Type:</strong> {error.type}</div>
                      <div><strong>Error Code:</strong> {error.code}</div>
                      <div><strong>Status Code:</strong> {error.statusCode}</div>
                      <div><strong>Request ID:</strong> {error.requestId}</div>
                    </div>
                  }
                  type="error"
                  showIcon
                  style={{ marginBottom: '8px' }}
                />
              ))}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">No error details available</Text>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AiSuggestionSettings; 