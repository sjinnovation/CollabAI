import { useState, useEffect, useContext } from "react";
import "./Chat.css";
import { ThemeContext } from "../../contexts/themeConfig";

// libraries
import { HiCheck, HiOutlineClipboard, HiChevronDown, HiChevronRight } from "react-icons/hi2";
import { marked } from "marked";
import CodeHighlighter from "../common/CodeHighlighter";
import { copyToClipboard } from "../../Utility/helper";
import * as DOMPurify from "dompurify";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { checkIsValidUrl, getImageLink, handleDownloadS3Image } from "../../api/fluxImageGenerator";
import { MermaidDiagram } from "../../Utility/mermaid";
import download from "../../../src/assests/images/download.png";

// Components
import ShareDropdown from "./ShareDropdown";
import LinkedInPostPopup from '../Linkedin/LinkedinPostPopup.tsx';
import { shareToLinkedIn } from "../../api/linkedinApi";
import { LINKEDIN_GET_POST } from '../../constants/Api_constants';
import { HiOutlineDownload } from 'react-icons/hi';
import { message } from "antd";
import { getAllAssistantsIds } from "../../api/assistantTypeApi";
import agentPlaceholder from "../../../src/assests/images/agents-placeholder.png";

const BotResponse = ({ chatPrompt, response }) => {
  const { theme } = useContext(ThemeContext);
  const [formattedResponseArray, setFormattedResponseArray] = useState();

  const [showTick, setShowTick] = useState(false);
  const [thinkContent, setThinkContent] = useState(null);
  const [isThinkExpanded, setIsThinkExpanded] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shareData, setShareData] = useState({
    platform: "",
    chatPrompt: "",
    textToShare: "",
  });

  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [themeColor, setThemeColor] = useState("#F9FAFB");

  const location = useLocation();
  const [s3Link, setS3Link] = useState('');

  const [isLinkedInPopupOpen, setIsLinkedInPopupOpen] = useState(false);
  const [allAssistants, setAllAssistants] = useState([]);

  let tickTimeout = false;

  // Check if the response is a Base64 image string
  const isBase64Image = (str) => {
    return /^data:image\/[a-zA-Z]+;base64,/.test(str);
  };

  // Check if the response is an image URL
  const isImageUrl = (str) => {
    return /^http/.test(str);
  };

  const getAllAssistants = async () => {
    const userId = localStorage.getItem("userID");
    const response = await getAllAssistantsIds(userId);
    setAllAssistants(response);
  }
  
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    let colorFromUrl = queryParams.get("color");
    let textColorFromUrl = queryParams.get("textColor");
    let themeColorFromUrl = queryParams.get("themeColor");
    getAllAssistants();

    // if (colorFromUrl) {
    //   colorFromUrl = colorFromUrl === "red" ? "#ff0000" : colorFromUrl;
    //   setBgColor(colorFromUrl);
    // }

    // if (textColorFromUrl) {
    //   setTextColor(textColorFromUrl);
    // }

    // if (themeColorFromUrl) {
    //   setThemeColor(themeColorFromUrl);
    // }
  }, [location]);

  const processThinkContent = (text) => {
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const matches = [...text.matchAll(thinkRegex)];

    if (matches.length > 0) {
      const extracted = matches.map(m => m[1].trim()).join('\n');
      setThinkContent(extracted);
      return text.replace(thinkRegex, '');
    }
    setThinkContent(null);
    return text;
  };

  const replaceCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w+)\s*([\s\S]+?)```/g;
    let match;
    let lastIndex = 0;
    const result = [];

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1].toLowerCase();
      const code = match[2].trim();
      const precedingText = text.substring(lastIndex, match.index);
      if (precedingText) {
        result.push({ type: "text", content: precedingText });
      }

      // Add code block as a code object
      result.push({ type: "code", content: code, language });

      lastIndex = match.index + match[0].length;
    }

    const remainingText = text.substring(lastIndex);

    // Add remaining text as a text object
    if (remainingText) {
      result.push({ type: "text", content: remainingText });
    }

    return result;
  };

  useEffect(() => {
    if (response) {
      setIsThinkExpanded(false);
      const cleanedResponse = processThinkContent(response);
      const responseWithoutCodeBlocks = replaceCodeBlocks(cleanedResponse);
      setFormattedResponseArray(responseWithoutCodeBlocks);
    }

    return () => {
      if (tickTimeout) {
        clearTimeout(tickTimeout);
      }
    };
  }, [response]);

  const onShowTick = () => {
    setShowTick(true);
    if (tickTimeout) {
      clearTimeout(tickTimeout);
    }

    tickTimeout = setTimeout(() => {
      setShowTick(false);
    }, 2000);
  };

  // const prepareShareModal = (platform, chatPrompt, textToShare) => {
  //   setShareData({ platform, chatPrompt, textToShare });
  //   setIsModalVisible(true);
  // };

  const { imageUrl, isImageLinkFound } = getImageLink(response);

  useEffect(() => {
    if (isImageLinkFound) {
      setS3Link(imageUrl);
    }
  }, [imageUrl, isImageLinkFound]);

  const handleCopyContent = (textToCopy) => {
    if (isBase64Image(textToCopy)) {
      message.warning("Image cannot be copied as text. Please download it.");
      return;
    }

    const result = textToCopy
      .replace(/【.*?】/g, "")
      .replace(/\[0\]/g, "")
      .replace(/<div class="citations-container">.*?<\/div>/g, "");

    const isCopied = copyToClipboard(result);
    if (isCopied) onShowTick();
  };

  // Utility to download base64 image
  const handleDownloadBase64Image = (base64String, filename = "image.png") => {
    const link = document.createElement("a");
    link.href = base64String;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLinkedinShareContent = async (chatPrompt, textToShare) => {
    try {
      if (isBase64Image(textToShare)) {
        // Show warning message if the content is a base64 image
        message.warning("Image cannot be shared as text. Please download it.");
        return;
      }

      const response = await shareToLinkedIn(chatPrompt, textToShare);
      if (response) {
        const postUrl = LINKEDIN_GET_POST(response.id);
        toast.success(
          <div>
            Successfully shared to LinkedIn!{' '}
            <a
              href={postUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0077B5', textDecoration: 'underline' }}
              onClick={(e) => e.stopPropagation()}
            >
              View post
            </a>
          </div>, {
          position: "bottom-left",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsLinkedInPopupOpen(false);
      }
    } catch (error) {
      toast.error('Failed to share to LinkedIn. Please try again.', {
        position: "bottom-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const displayDraftUrlMessage = (draftUrl) => {
    if (draftUrl) {
      const message = (
        <div className="draftMessage">
          New email created.
          <Link
            className="draftUrl"
            to={draftUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Gmail
          </Link>
        </div>
      );

      toast.info(message, {
        position: "bottom-left",
        autoClose: 10000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        onClick: () => {
          window.open(draftUrl, "_blank");
        },
      });
    }
  };

  const handleShareContent = (chatPrompt, textToShare) => {
    try {
      if (isBase64Image(textToShare)) {
        // Show warning message if the content is a base64 image
        message.warning("Image cannot be shared as text. Please download it.");
        return;
      }

      const truncate = (input) => input.length > 100 ? `${input.substring(0, 100)}...` : input;

      const encodedTitle = encodeURIComponent(truncate(chatPrompt));
      const encodedBody = encodeURIComponent(textToShare);

      const draftUrlTemplate = process.env.REACT_APP_GMAIL_DRAFT_URL_TEMPLATE;
      const draftUrl = `${draftUrlTemplate}su=${encodedTitle}&body=${encodedBody}`;

      displayDraftUrlMessage(draftUrl);
    } catch (error) {
      console.error(error);
    }
  };

  const getMarkedContent = (content) => {
    const hasAssistantTag = /<asst_[^>]+>/.test(content);
    const assistantTagMatches = [...content.matchAll(/<asst_([^>]+)>/g)];
    const assistantObjects = assistantTagMatches.map((match) => ({
      id: `asst_${match[1]}`,
      img_url: ""
    }));

    allAssistants.forEach(assistant => {
      let found = assistantObjects.find(obj => obj.id == assistant.assistant_id);
      if (found) {
        found.img_url = assistant.image_url;
      }
    });

    let result = content.replace(/【.*?】/g, "").replace(/\[0\]/g, "").replace(/<div class="citations-container">(?!.*<a.*?>).*?<\/div>/g, "");
    if (hasAssistantTag) {
      assistantObjects.forEach(obj => {
        const tag = `<${obj.id}>`;
        const imgSrc = obj.img_url || agentPlaceholder;
        const imgTag = `<img src="${imgSrc}" alt="Bot" class="bot-image" />`;
        result = result.replace(tag, imgTag);
      });
    }
    const sanitizedContent = DOMPurify.default.sanitize(result);
    const tableHtml = { __html: marked(sanitizedContent) };

    return (
      <div
        id="table-response-container"
        className={`table-${theme}`}      >
        <div dangerouslySetInnerHTML={tableHtml} />
      </div>
    );
  };

  const renderThinkContent = () => {
    if (!thinkContent) return null;

    return (
      <div className={`think-container ${theme}`}>
        <button
          className="think-toggle"
          onClick={() => setIsThinkExpanded(!isThinkExpanded)}
          aria-expanded={isThinkExpanded}
        >
          <span>Internal Reasoning</span>
          {isThinkExpanded ? (
            <HiChevronDown className="think-chevron-icon" />
          ) : (
            <HiChevronRight className="think-chevron-icon" />
          )}
        </button>
        {isThinkExpanded && (
          <div className="think-content">
            <pre>{thinkContent}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bot-response-markdown-container">
      {renderThinkContent()}
      <div className="bot-response-main-content">
        {/* Handle base64 image or image URL */}
        {typeof response === "string" &&
          (isBase64Image(response) || isImageUrl(response)) && (
            <div className="bot-image-response">
              <img
                src={response}
                alt="Bot Response"
                className="response__preview-image"
              />
            </div>
          )}

        {formattedResponseArray?.map((item, index) => {
          // Check if the item content starts with data:image or http
          if (typeof item.content === 'string' && (item.content.startsWith('data:image') || item.content.startsWith('http'))) {
            return null;  // Does not render anything if it's an image URL or base64 string
          }

          if (item.type === "text") {
            return (
              <div>
                {isImageLinkFound ? (
                  checkIsValidUrl(imageUrl) ? (
                    <img src={imageUrl}></img>
                  ) : null
                ) : (
                  <pre key={index}>{getMarkedContent(item.content)}</pre>
                )}
              </div>
            );
          } else if (item.type === "code" && item.language !== "mermaid") {
            return (
              <CodeHighlighter
                key={index}
                code={item.content}
                language={item.language}
              />
            );
          } else if (item.type === "code" && item.language === "mermaid") {
            return (
              <MermaidDiagram
                key={index}
                code={item.content}
                isMermaid={true}
              />
            );
          }
        })}
      </div>

      <div className="bot-response-buttons">
        <div className="bot-response-action-btn">
          <ShareDropdown
            handleShareContent={handleShareContent}
            handleLinkedinShareContent={handleLinkedinShareContent}
            chatPrompt={chatPrompt}
            response={response}
          />
        </div>

        {isBase64Image(response) && (
          <div className="bot-response-action-btn">
            <button
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
              onClick={() => handleDownloadBase64Image(response, "generated_image.png")}
            >
              <HiOutlineDownload
                size={18}
                color={theme === 'light' ? '#000' : '#fff'}
              />
              <span
                style={theme === 'light' ? { color: '#000' } : { color: '#fff' }}
              >
                {/* Download */}
              </span>
            </button>
          </div>
        )}

        <div className="bot-response-action-btn">
          <button
            onClick={() => handleCopyContent(response)}
            className="copy-icon"
          >
            {showTick ? (
              <>
                <HiCheck
                  size={18}
                  color={theme === "light" ? "#000" : "#fff"}
                />
                <span
                  className="copy-text"
                  style={
                    theme === "light" ? { color: "#000" } : { color: "#fff" }
                  }
                >
                  Copied!
                </span>
              </>
            ) : (
              <>
                <HiOutlineClipboard
                  size={18}
                  color={theme === "light" ? "#000" : "#fff"}
                />
                <span
                  className="copy-text"
                  style={
                    theme === "light" ? { color: "#000" } : { color: "#fff" }
                  }
                >
                  Copy
                </span>
              </>
            )}
          </button>
        </div>
        {s3Link && (
          <div className="bot-response-action-btn">
            <img
              src={download}
              alt="download logo"
              onClick={async () => await handleDownloadS3Image(s3Link)}
            />
          </div>
        )}
      </div>

      <LinkedInPostPopup
        isOpen={isLinkedInPopupOpen}
        onClose={() => setIsLinkedInPopupOpen(false)}
        onShare={handleLinkedinShareContent}
        initialText={response}
        chatPrompt={chatPrompt}
      />
    </div>
  );
};

export default BotResponse;
