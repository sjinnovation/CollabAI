import { useState, useEffect } from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, theme } from "antd";
import BotResponse from "./BotResponse";

const CodeInterPreterOutput = ({ output }) => {
  const { token } = theme.useToken();
  const [activeKey, setActiveKey] = useState(["1"]);

  useEffect(() => {
    if (
      typeof output === "string" &&
      output.includes("</interpretedMessage>")
    ) {
      setActiveKey([]);
    } else {
      const timer = setTimeout(() => {
        setActiveKey([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [output]);

  const panelStyle = {
    marginBottom: 24,
    background: token?.colorFillAlter,
    borderRadius: token?.borderRadiusLG,
    border: "none",
    maxWidth: "50.75rem",
  };

  const ContentList = (panelStyle) => [
    {
      key: "1",
      label: <strong>Code Interpreter Outputs</strong>,
      children: <BotResponse response={output} />,
      style: panelStyle,
    },
  ];

  return (
    <div className="codeInterpreterOutputContainer">
      <Collapse
        bordered={false}
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        items={ContentList(panelStyle)}
      />
    </div>
  );
};

export default CodeInterPreterOutput;
