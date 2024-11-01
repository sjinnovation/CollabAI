import { Modal, message } from 'antd';
import { axiosSecureInstance } from '../api/axios';

const { confirm } = Modal;

export const showDeleteConfirm = (assistantId, assistantName, handleDeleteAssistant) => {
  confirm({
    title: 'Are you sure delete this Agent?',
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
    const url = `/agents/${assistantId}`;
    window.open(url, "_blank");
  };

export const getAssistantInfo =async (assistantId)=>{
    try {
      const response = await axiosSecureInstance.get(
        `/api/assistants/getAssistantInfo/${assistantId}`
      );
      if (response) {
        return true
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        message.error("This assistant doesn't exist on the platform. Please recreate or delete it");
      } else {
        message.error(error);

      }
      return false;

    }

  }