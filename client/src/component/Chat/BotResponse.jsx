import React, { useState, useEffect, useContext } from "react";
import "./Chat.css";
import { ThemeContext } from "../../../src/contexts/themeConfig";

// libraries
import { HiCheck, HiOutlineClipboard, HiShare } from "react-icons/hi2";
import { marked } from "marked";
import CodeHighlighter from "../common/CodeHighlighter";
import { copyToClipboard } from "../../Utility/helper";
import * as DOMPurify from "dompurify";
import { Link } from "react-router-dom";

// components
import ShareDropdown from "./ShareDropdown";
import { toast } from "react-toastify";

const BotResponse = ({ chatPrompt, response }) => {
  const { theme } = useContext(ThemeContext);
  const [formattedResponseArray, setFormattedResponseArray] = useState();
  const [showTick, setShowTick] = useState(false);

  let tickTimeout = false;

  const replaceCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w+)\s*([\s\S]+?)```/g;
    let match;
    let lastIndex = 0;
    const result = [];

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const language = match[1].toLowerCase();
      const code = match[2].trim();
      const precedingText = text.substring(lastIndex, match.index);

      // Add preceding text as a text object
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
      setFormattedResponseArray(replaceCodeBlocks(response));
    }

    return () => {
      if (tickTimeout) {
        clearTimeout(tickTimeout);
      }
    };
  }, [response]);

  const getMarkedContent = (content) => {
    // Sanitize the content to prevent XSS
    const sanitizedContent = DOMPurify.sanitize(content);
    const tableHtml = { __html: marked(sanitizedContent) };

    return (
      <div id="table-response-container" className={`table-${theme}`}>
        <div dangerouslySetInnerHTML={tableHtml} />
      </div>
    );
  };

  const onShowTick = () => {
    setShowTick(true);
    if (tickTimeout) {
      clearTimeout(tickTimeout);
    }

    tickTimeout = setTimeout(() => {
      setShowTick(false);
    }, 2000);
  };

  const handleCopyContent = (textToCopy) => {
    const isCopied = copyToClipboard(textToCopy);
    if (isCopied) onShowTick();
  };

  const handleShareContent = (chatPrompt, textToShare) => {
    try {
      const truncate = (input) =>
        input.length > 100 ? `${input.substring(0, 100)}...` : input;

      const encodedTitle = encodeURIComponent(truncate(chatPrompt));
      const encodedBody = encodeURIComponent(textToShare);

      // Use the correct environment variable REACT_APP_GMAIL_DRAFT_URL_TEMPLATE
      const draftUrlTemplate = process.env.REACT_APP_GMAIL_DRAFT_URL_TEMPLATE;
      const draftUrl = `${draftUrlTemplate}su=${encodedTitle}&body=${encodedBody}`;

      // Call the function to display the message with the link
      displayDraftUrlMessage(draftUrl);
    } catch (error) {
      console.error(error);
    }
  };


  // Function to display a message with draft email URL
  const displayDraftUrlMessage = (draftUrl) => {
    if (draftUrl) {
      // Create a message with a link to the draft email
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

      // Display the message as a toast notification
      toast.info(message, {
        position: "bottom-left",
        autoClose: 10000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        // Open the draft email on click
        onClick: () => {
          window.open(draftUrl, "_blank");
        },
      });
    }
  };

  return (
    <div className="bot-response-markdown-container">
      <div className="bot-response-main-content">
        {formattedResponseArray?.map((item, index) => {
          if (item.type === "text") {
            return <pre key={index}>{getMarkedContent(item.content)}</pre>;
          } else if (item.type === "code") {
            return (
              <CodeHighlighter
                key={index}
                code={item.content}
                language={item.language}
              />
            );
          }
        })}
      </div>

      {/* response-control-container */}
      <div className="bot-response-control-container">
        {/* Share option */}
        <div className="bot-response-share-btn">
          <ShareDropdown
            handleShareContent={handleShareContent}
            chatPrompt={chatPrompt}
            response={response}
          />
        </div>

        {/* copy btn */}
        <div className="bot-response-copy-btn">
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
      </div>
    </div>
  );
};

export default BotResponse;
