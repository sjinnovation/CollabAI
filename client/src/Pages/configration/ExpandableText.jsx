import React, { useContext, useState, useEffect, useRef } from 'react';
import { Typography } from 'antd';
import { ThemeContext } from '../../contexts/themeConfig';
import './style.css';

const { Text } = Typography;

const ExpandableText = ({ text, maxLines = 2 }) => {
  const [expanded, setExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const { theme } = useContext(ThemeContext);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkTextOverflow = () => {
      if (textRef.current && containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const textHeight = textRef.current.scrollHeight;
        setShowMoreButton(textHeight > containerHeight);
      }
    };

    checkTextOverflow();
    window.addEventListener('resize', checkTextOverflow);
    return () => window.removeEventListener('resize', checkTextOverflow);
  }, [text, maxLines]);

  const renderHTML = (rawHTML) => React.createElement("div", { dangerouslySetInnerHTML: { __html: rawHTML } });

  return (
    <div className={`expandable-text ${expanded ? 'expanded' : ''} ${theme}`}>
      <div
        ref={containerRef}
        className={`text-container ${expanded ? 'text-container-expanded' : 'text-container-collapsed'}`}
      >
        <div ref={textRef}>
          {renderHTML(text)}
        </div>
      </div>
      {showMoreButton && (
        <Text
          onClick={() => setExpanded(!expanded)}
          className="show-more-button"
        >
          {expanded ? 'Show less' : 'Show more'}
        </Text>
      )}
    </div>
  );
};

export default ExpandableText;