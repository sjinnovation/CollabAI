import React from "react";
import { CaretRightOutlined } from "@ant-design/icons";
import { Collapse, theme, Typography } from "antd";
import BotResponse from "./BotResponse";

const CodeInterPreterOutput = ({ output }) => {
  const { token } = theme.useToken();
  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: "none",
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
    <Collapse
      bordered={false}
      defaultActiveKey={["1"]}
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      style={{
        background: token.colorBgContainer,
      }}
      items={ContentList(panelStyle)}
    />
  );
};

export default CodeInterPreterOutput;
