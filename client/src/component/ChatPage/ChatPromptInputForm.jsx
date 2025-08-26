import { useContext, useState, useEffect } from "react";
import { Button, Tooltip, Upload } from "antd";
import { Select, message, Typography } from "antd";
import { SendOutlined, UnorderedListOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { botOptions, botIconsMap, buildModelOptions } from "../../constants/chatPageConstants";
import { ThemeContext } from "../../contexts/themeConfig";
import UsefulPromptDropdown from "./UsefulPromptDropdown";
import { FaRegStopCircle } from "react-icons/fa";
import { RiImageAddFill } from "react-icons/ri";
import { useLocation } from "react-router-dom";
import { axiosSecureInstance } from "../../../src/api/axios.js";
import './ChatPromptInputFormResponsive.css';
import { HfMessages } from '../../../src/constants/huggingfaceConstants.js';

const { Text } = Typography;
const SHORTCUT_PROMPT_ERROR = "Please enter a prompt before selecting a command!";
const SEPARATOR_TIP = "Tip: Use exactly 4 dashes '----' as the separator to queue more than one message in one go";
const ChatPromptInputForm = ({
  states,
  actions,
  refs,
  showSelectors = true,
}) => {
  const {
    loading = false,
    setLoading,
    inputPrompt = "",
    showPromptDropdown,
    showMessage,
    setShowMessage,
    dynamicBotOptions,
    selectedModel,
    setSelectedModel,
  } = states;
  const { promptInputRef } = refs;
  const {
    onSubmit,
    setSelectedChatModel,
    setInputPrompt,
    setShowPromptDropdown,
    handleStopGeneratingButton
  } = actions;
  const { theme } = useContext(ThemeContext);

  const [selectedBot, setSelectedBot] = useState(null);
  const [selectedOperationType, setSelectedOperationType] = useState(null); // New state to store operationType
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const finalModelOptions = buildModelOptions(dynamicBotOptions);

  useEffect(() => {
    if (location.state?.selectedModel) {
      const selectedModel = location.state.selectedModel;
      setSelectedBot(selectedModel.name);
      setSelectedChatModel(selectedModel.name);
      setSelectedOperationType(selectedModel.inputOutputType); // Set the inputOutputType when model is selected
    }
    else if (!selectedBot && dynamicBotOptions.length) {
      const defaultStaticModel = botOptions.find(opt => opt.value === 'openai'); // ChatGPT as default
      if (defaultStaticModel) {
        setSelectedBot(defaultStaticModel.value);
        setSelectedChatModel(defaultStaticModel.value);
        // Do not set inputOutputType here, since static models may not have it
      }
    }
  }, [location.state, dynamicBotOptions]);


  useEffect(() => {
    const storedProvider = localStorage.getItem("selectedBot");
    const storedModel = localStorage.getItem("selectedModel");

    if (storedProvider && storedModel) {
      setSelectedBot(storedProvider);
      setSelectedChatModel(storedProvider);
      setSelectedModel(storedModel);
    } else if (storedProvider && !storedModel) {
      const defaultModelForProvider = buildModelOptions(dynamicBotOptions)[storedProvider]?.[0];
      if (defaultModelForProvider) {
        setSelectedBot(storedProvider);
        setSelectedChatModel(storedProvider);
        setSelectedModel(defaultModelForProvider.value);
        localStorage.setItem("selectedModel", defaultModelForProvider.value);
      }
    } else if (location.state?.selectedModel) {
      const selectedModel = location.state.selectedModel;
      setSelectedBot(selectedModel.name);
      setSelectedChatModel(selectedModel.name);
      setSelectedModel(selectedModel.value);
    } else if (!selectedBot && dynamicBotOptions.length) {
      const defaultStaticModel = botOptions.find(opt => opt.value === 'openai');
      if (defaultStaticModel) {
        const firstModel = buildModelOptions(dynamicBotOptions)[defaultStaticModel.value]?.[0];
        if (firstModel) {
          setSelectedBot(defaultStaticModel.value);
          setSelectedChatModel(defaultStaticModel.value);
          setSelectedModel(firstModel.value);
          localStorage.setItem("selectedBot", defaultStaticModel.value);
          localStorage.setItem("selectedModel", firstModel.value);
        }
      }
    }
  }, [location.state, dynamicBotOptions]);

  /*const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    if (isModalVisible) {
      setInputPrompt('');
      setModalKey(prevKey => prevKey + 1);
    }
  };

  const handleSelectPromptTemplate = (template) => {
    setInputPrompt(template.description);
    setIsModalVisible(false);
  };


  // Update the handleBotChange logic
  const handleBotChange = (selectedValue) => {
    const selectedModel = dynamicBotOptions.find(option => option.value === selectedValue);
    if (selectedModel) {
      setSelectedChatModel(selectedValue);
      setSelectedBot(selectedValue);
      setSelectedOperationType(selectedModel.inputOutputType); // Update inputOutputType when bot is changed
      setImage(null); // Clear image when switching model
    } else {
      // If bot is not from dynamic options, skip inputOutputType
      setSelectedChatModel(selectedValue);
      setSelectedBot(selectedValue);
      setImage(null); // Clear image for non-dynamic bot options
    }
  };*/

  const handleKeyDown = (event) => {
    if (loading) return;

    if (event.key === "/") {
      setShowPromptDropdown(true);
    }
    if (event.key !== "/" && showPromptDropdown) {
      setShowPromptDropdown(false);
    }

    if (event.key === "Enter" && event.shiftKey) {
      setInputPrompt((prevValue) => prevValue); // Allow Shift+Enter for new line
    } else if (event.key === "Enter") {
      event.preventDefault(); // Prevent any unintended button activation
      event.target.style.height = "51px";

      if (image) {
        handleSendWithImage();
      } else {
        onSubmit(event);
        setImage(null);
      }

      // Refocus the input field after sending
      setTimeout(() => {
        promptInputRef.current?.focus();
      }, 100);
    }
  };

  const onInputPromptChange = (event) => {
    setInputPrompt(event.target.value);
    // Show message if there are separators in the text
    setShowMessage(event.target.value.includes('----'));
  };

  const handleUsefulPromptSelection = (selectedPrompt) => {
    const lastSlashRemoved = inputPrompt.replace(/\/$/, "");
    if (!lastSlashRemoved.trim()) {
      return message.warning(SHORTCUT_PROMPT_ERROR);
    }
    if (selectedPrompt && selectedPrompt?.label) {
      let userInputtedPrompt = `${lastSlashRemoved} ${selectedPrompt.label}`;
      setInputPrompt(userInputtedPrompt);
      setShowPromptDropdown(false);
      onSubmit(null, userInputtedPrompt);
    }
  };

  /*const scrollUp = () => {
    const textarea = promptInputRef.current;
    if (textarea) {
      textarea.scrollBy(0, -30);
    }
  };

  const scrollDown = () => {
    const textarea = promptInputRef.current;
    if (textarea) {
      textarea.scrollBy(0, 30);
    }
  };*/

  const [image, setImage] = useState(null);

  const handleImageUpload = async (file) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
      setInputPrompt((prevPrompt) => prevPrompt + " " + reader.result);

      // Move focus back to text input
      setTimeout(() => {
        promptInputRef.current?.focus();
      }, 100);
    };

    const validImageTypes = ['image/png', 'image/jpeg'];
    if (!validImageTypes.includes(file.type)) {
      message.error(HfMessages.HF_IMA_TYPE_ERR);
      return false;
    }

    reader.readAsDataURL(file);
    return false;
  };

  const handleSendWithImage = () => {
    if (image) {
      onSubmit(null, image);
      setImage(null);
    } else if (inputPrompt) {
      onSubmit(null, inputPrompt);
    }

    // Remove '-hf' if it exists in the model name before sending the request
    const cleanedModelName = selectedBot?.replace("-hf", "");
    const modelData = { modelName: cleanedModelName, inputData: image || inputPrompt };

    setLoading(true);

    axiosSecureInstance
      .post(`${process.env.REACT_APP_BASE_URL}api/models/process`, modelData)
      .then((response) => {
      })
      .catch((error) => {
        message.error(HfMessages.HF_PROC_ERR);
      })
      .finally(() => {
        setLoading(false); //Hide stop button
      });

    setImage(null);
  };

  // Disable button if inputOutputType is not image-to-text or image-classification
  const isButtonDisabled = loading || selectedBot && dynamicBotOptions.some(option => option.value === selectedBot) && !['image-to-text', 'image-classification'].includes(selectedOperationType) ||
    botOptions.some(option => option.value === selectedBot); // Disable image button for all botOptions

  return (
    <div className="parent-container">
      <form
        className={`form-style ${theme === "dark" && "dark-mode"} responsive-form`}
        onSubmit={onSubmit}
      >
        {showMessage && (
          <div className="query-massage">
            <p>
              <InfoCircleOutlined />
              <b className="ms-2 queue-title">{inputPrompt.split('----').filter(part => part.trim()).length} messages will be queued </b>
              <br />
              <small className="ms-4 queue-desc">{SEPARATOR_TIP}</small>
            </p>
          </div>
        )}

        <div className={`inputPromptTextarea-container ${theme === "dark" && "dark-mode"}`}>
          {showSelectors && (
            <div
              className={`select-container-whole ${theme === "dark" && "dark-mode"
                } responsive-select-container-whole`}
            >
              <div className="select-container responsive-select-container">
                <Tooltip title="Choose AI and Model">
                  <Select
                    style={{ width: "40%" }}
                    placeholder="Choose Model"
                    onChange={(value, option) => {
                      const [provider, model] = value.split("|");

                      setSelectedBot(provider);
                      setSelectedChatModel(provider);
                      setSelectedModel(model);

                      localStorage.setItem("selectedBot", provider);
                      localStorage.setItem("selectedModel", model);
                    }}
                    
                    value={selectedModel? `${selectedBot}|${selectedModel}`:'GPT-4o' // : undefined
                    }                    
                    className="custom-select-bot responsive-select-bot"
                    placement="topLeft"
                    dropdownStyle={{
                      minWidth: "400px",
                      padding: "10px",
                      backgroundColor: theme === "dark" ? "#1f1f1f" : "#fff",
                      borderRadius: "8px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    }}
                    optionLabelProp="label"
                  >
                    {Object.entries(finalModelOptions).map(([provider, models]) => {
                      const { name, icon } = botIconsMap[provider] || {
                        name: provider,
                      };

                      return (
                        <Select.OptGroup
                          key={provider}
                          label={
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              {icon && <img src={icon} alt={name} width={16} />}
                              {name}
                            </span>
                          }
                        >
                          {models.map((model) => (
                            <Select.Option
                              key={`${provider}|${model.value}`}
                              value={`${provider}|${model.value}`}
                              label={model.label}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <strong>{model.label}</strong>
                                <small style={{ color: "#999" }}>
                                  {model.description}
                                </small>
                              </div>
                            </Select.Option>
                          ))}
                        </Select.OptGroup>
                      );
                    })}
                  </Select>
                </Tooltip>
              </div>
              <div className="blurry-box"></div>
            </div>
          )}
          <UsefulPromptDropdown
            isVisible={showPromptDropdown}
            onSelection={handleUsefulPromptSelection}
          >
            <textarea
              ref={promptInputRef}
              autoComplete="off"
              placeholder="Ask me anything..."
              name="inputPrompt"
              className={`inputPrompttTextarea ${theme === "dark" && "dark-mode"
                } responsive-input-textarea`}
              rows="2"
              value={inputPrompt}
              onKeyDown={handleKeyDown}
              onChange={onInputPromptChange}
              style={{ height: "auto" }}
              onInput={(e) => {
                const textarea = e.target;
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
              }}
            />
          </UsefulPromptDropdown>
          <div className="actions-container responsive-actions-container">
            <Tooltip title="Upload an image (Only .jpeg and .png)">
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleImageUpload}
                customRequest={handleImageUpload}
              >
                <Button icon={<RiImageAddFill />} disabled={isButtonDisabled} />
              </Upload>
            </Tooltip>
            <div className="d-flex">
              <button
                disabled={loading || !inputPrompt.trim()}
                aria-label="Insert separator"
                className={`sendIcon-outline ${theme === "dark" && "dark-mode"} responsive-send-icon-outline`}
                type="button"
                onClick={() => {
                  setInputPrompt(prev => `${prev}\n----\n`);
                  setShowMessage(true);
                }}
              >
                <UnorderedListOutlined />
              </button>
              <button
                disabled={loading || !inputPrompt.trim()}
                aria-label="form submit"
                className={`sendIcon ${theme === "dark" && "dark-mode"} responsive-send-icon`}
                type="submit"
              >
                <SendOutlined className="send" />
              </button>
            </div>
          </div>
        </div>
      </form>
      {loading ? (
        <div className="stop-generating-btn-container multi-provider-area-stop-btn">
          <Button danger type="primary" onClick={handleStopGeneratingButton} style={{ width: "160px", }} icon={<FaRegStopCircle />} size={30}>
            Stop Generating
          </Button>
        </div>
      ) : <></>}
      <div
        style={{ marginTop: "20px" }}
        className={`shortcut-text ${theme === "dark" && "dark-mode"} responsive-shortcut-text`}
      >
        <Text style={{ color: "#717171" }}>
          Press <span className={`slash-icon ${theme === "dark" && "dark-mode"}`}>/</span> to access a list of task commands.</Text>
      </div>
    </div>
  );
};
export default ChatPromptInputForm;