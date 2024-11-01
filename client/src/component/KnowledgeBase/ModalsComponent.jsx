import React from 'react';
import { Modal } from 'antd';

const ModalsComponent = ({
  isModalVisible,
  handleOk,
  handleCancel,
  selectedRowKeys
}) => {
  return (
    <>
      <Modal
        title="Delete All Knowledge Base"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>You are deleting All KnowledgeBase.</p>
      </Modal>
    </>
  );
};

export default ModalsComponent;
