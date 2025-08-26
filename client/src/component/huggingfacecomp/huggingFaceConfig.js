import React from "react";
import { Form, Row, Col, List, Button } from "antd";
import HuggingFaceModels from "./HuggingFaceModels";
import HuggingfacetokenConfig from "../../Pages/configration/HuggingfacetokenConfig";
import "./huggingfaceconfig.css";

const HuggingFaceConfigForm = () => {
  return (
    <div className="config-container">
      <Form layout="vertical" className="custom-form">
        <Row gutter={[0, 0]}>
          <Col span={12} className="token-column">
          <div className="list-header">Hugging Face Configuration</div>
                <HuggingfacetokenConfig />
          </Col>

          <Col span={28}>
            <div className="list-header divider-h1">List of Models</div>
            <div className="models-table-wrapper">
              <HuggingFaceModels />
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default HuggingFaceConfigForm;