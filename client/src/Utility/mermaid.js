import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../contexts/themeConfig";
import mermaid from "mermaid";
import CodeHighlighter from "../component/common/CodeHighlighter";

export const MermaidDiagram = ({ code, isMermaid }) => {
    const { theme } = useContext(ThemeContext);
    const uniqueId = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);
    const diagramRef = useRef(null);
    const [svg, setSvg] = useState('');
  
    useEffect(() => {
      if (isMermaid && code.trim()) {
        mermaid.initialize({
          startOnLoad: true,
          theme: theme === "dark" ? "dark" : "default",
        });
        try {
          mermaid.render(uniqueId.current, code).then(({ svg }) => {
            setSvg(svg);
          });
        } catch (error) {
          console.error("Error rendering Mermaid diagram:", error);
          setSvg('');
        }
      }
    }, [code, theme, isMermaid]);
  
    useEffect(() => {
      if (diagramRef.current && svg) {
        diagramRef.current.innerHTML = svg;
      }
    }, [svg]);
  
    if (!isMermaid) {
      return <CodeHighlighter code={code} language="mermaid" />;
    }
  
    return (
      <div className="mermaid-container">
        <CodeHighlighter code={code} language="mermaid" />
        <div className={`mermaid-diagram ${theme}`} ref={diagramRef} />
      </div>
    );
  };