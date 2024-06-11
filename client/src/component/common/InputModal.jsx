import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';

export const InputModal = ({ propsData }) => {
  const { title, data,placeholder, open, onCancel, onOk, okText, formItems, form } = propsData;
  const [firstFormItem] = formItems;
  const { name, label, rules } = firstFormItem;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ [name]: data });
    }
  }, [open, data, name, form]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText={okText}
    >
      <Form form={form} layout="vertical" onFinish={onOk}>
        <Form.Item
          name={name}
          label={label}
          rules={rules}
        >
          <Input placeholder={placeholder}/>
        </Form.Item>
      </Form>
    </Modal>
  );
};
