import { Modal } from 'antd';

const { confirm } = Modal;

export const showDeleteConfirm = (assistantId, assistantName, handleDeleteAssistant) => {
  confirm({
    title: 'Are you sure delete this Assistant?',
    content: `You are deleting ${assistantName}.`,
    okText: 'Yes',
    okType: 'danger',
    cancelText: 'No',
    onOk() {
      handleDeleteAssistant(assistantId);
    },
    onCancel() {
      console.log('Cancel');
    },
  });
};

// Function to redirect to assistant details pages
export const redirectToAssistant = (record) => {
    const assistantId = record.assistant_id;
    const url = `/assistants/${assistantId}`;
    window.open(url, "_blank");
  };
