import React from 'react'
import { Modal } from 'antd';
const ConfirmationModal = ({ open, onConfirm, onCancel, title, content, loading=false }) => {
  return (
    <Modal
    title={title || 'Confirmation'}
    open={open}
    onOk={onConfirm}
    okText="Delete"
    okType='danger'
    onCancel={onCancel}
    confirmLoading={loading}
  >
    <p>{content || 'Are you sure you want to proceed?'}</p>
  </Modal>
  )
}

export default ConfirmationModal