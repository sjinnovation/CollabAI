
import React from "react";
import "./Promptlist.scss"

//libraries
import { Modal, Row, Col } from "antd";

// ----- RENDER COMPONENT ----- //
const PromptDetailViewModal = ({ show, handleClose, viewDetails }) => {
  return (
    <Modal
      title="Prompt Details"
      visible={show}
      onCancel={handleClose}
      footer={null}
    >
      <Row>
        <Col className="mb-3">
          <strong>Question</strong>
        </Col>
      </Row>
      <Row>
        <Col className="mb-3">{viewDetails?.description}</Col>
      </Row>
      <Row>
        <Col className="mb-3">
          <strong>Response</strong>
        </Col>
      </Row>
      <Row>
        <Col className="mb-3">
          <textarea
            disabled
            defaultValue={viewDetails?.promptresponse}
            rows={10}
            cols={80}
            id="gptPrompt"
            className="custom-textarea"
            placeholder="Response"
          />
          {/* {viewDetails?.promptresponse} */}
        </Col>
      </Row>
    </Modal>
  );
};

export default PromptDetailViewModal;
