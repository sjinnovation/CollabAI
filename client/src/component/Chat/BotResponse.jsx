import React, { useState, useEffect } from "react";
import './Chat.css';

// libraries
import { HiCheck, HiOutlineClipboard } from "react-icons/hi2";
import { marked } from "marked";
import CodeHighlighter from "../common/CodeHighlighter";
import { copyToClipboard } from "../../Utility/helper";
import * as DOMPurify from 'dompurify';

// components

const BotResponse = ({ response }) => {
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
        result.push({ type: 'text', content: precedingText });
      }
  
      // Add code block as a code object
      result.push({ type: 'code', content: code, language });
  
      lastIndex = match.index + match[0].length;
    }
  
    const remainingText = text.substring(lastIndex);
    
    // Add remaining text as a text object
    if (remainingText) {
      result.push({ type: 'text', content: remainingText });
    }
  
    return result;
  };
  

  useEffect(() => {
      if(response) {
        setFormattedResponseArray(replaceCodeBlocks(response));
      }

      return () => {
        if (tickTimeout) {
          clearTimeout(tickTimeout);
        }
      };
  }, [response])

  const getMarkedContent = (content) => {
    // Sanitize the content to prevent XSS
    const sanitizedContent = DOMPurify.sanitize(content);
    const tableHtml = { __html: marked(sanitizedContent) };

    return (
      <div id="table-response-container">
        <div dangerouslySetInnerHTML={tableHtml} />
      </div>
    );
  }

  const onShowTick = () => {
    setShowTick(true);
      if (tickTimeout) {
        clearTimeout(tickTimeout);
      }

      tickTimeout = setTimeout(() => {
        setShowTick(false); 
      }, 2000); 
  }

  const handleCopyContent = (textToCopy) => {
    const isCopied = copyToClipboard(textToCopy);
    if(isCopied) onShowTick();
  }
 
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
        <div className="bot-response-copy-btn">
          <button onClick={() => handleCopyContent(response)} className="copy-icon">
            {showTick ? (
              <HiCheck size={18} />
            ) : (
              <HiOutlineClipboard size={18} />
            )}
          </button>
        </div>
      
    </div>
  );
};

export default BotResponse;
