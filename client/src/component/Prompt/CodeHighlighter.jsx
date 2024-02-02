import React, { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { FaCheck, FaCopy } from 'react-icons/fa'; // Assuming you have FontAwesome icons

const CodeHighlighter = ({ code, language }) => {
  const codeRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightBlock(codeRef.current);
    }
  }, [code]);

  const handleCopyClick = () => {
    const textarea = document.createElement('textarea');
    textarea.value = code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setIsCopied(true);

    // Reset the "Copied" state after a short delay
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  return (
    <div style={{ borderRadius: '0.875rem', overflow: 'hidden' }} className='d-flex flex-column'>
      <div className='d-flex w-100 justify-content-between align-items-center bg-dark py-1 px-4'>
        <pre className="text-white">
          {language}
        </pre>
        {
          isCopied ? <button className='d-flex justify-content align-items-center border-0 bg-transparent text-white' onClick={handleCopyClick}>
          <FaCheck size={14} /> <pre className='ps-1 fs-7'> Copied!</pre>
        </button> : <button className='d-flex justify-content align-items-center border-0 bg-transparent text-white' onClick={handleCopyClick}>
          <FaCopy size={14} /> <pre className='ps-1 fs-7'> Copy code</pre>
        </button>
        }
      </div>
      <pre>
        <code ref={codeRef} className={`${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeHighlighter;
