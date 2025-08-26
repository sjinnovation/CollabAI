import { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import "./InputModal.css"

export const InputModal = ({ propsData }) => {
  const { title, data, placeholder, open, onCancel, onOk, okText, formItems, form } = propsData;

  useEffect(() => {
    if (open) {
      const initialValues = formItems.reduce((acc, item) => {
        acc[item.name] = data?.[item.name] || null;
        return acc;
      }, {});
      form.setFieldsValue(initialValues);
    }
  }, [open, data, form, formItems]);

  return (
    <Modal
    title={title}
    open={open}
    onCancel={onCancel}
    footer={
      <div className="modal-footer">
        <div className="button-group">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={() => form.submit()}>
            {okText}
          </Button>
        </div>
      </div>
    }
  >
    <Form form={form} layout="vertical" onFinish={onOk}>
      {formItems.map((item) => (
        <Form.Item
          key={item.name}
          name={item.name}
          label={item.label}
          rules={item.rules}
        >
          <Input placeholder={placeholder} />
        </Form.Item>
      ))}
    </Form>
  </Modal>
  
  
  );
};