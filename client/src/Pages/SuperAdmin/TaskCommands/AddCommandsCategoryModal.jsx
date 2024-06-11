import React from "react";
import { Modal, Form, Input } from "antd";

const AddCommandsCategoryModal = ({ dataProps }) => {
  const { open, setOpen, actions } = dataProps;
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        actions.handleAddTaskCommandCategory(values);
        form.resetFields();
        setOpen(false);
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };
  return (
    <div>
      <Modal
        title="Create Commands Category"
        open={open}
        onOk={handleOk}
        okText="Create"
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" name="basicForm">
          <Form.Item
            label="Commands Category Name"
            name="commandsCategoryName"
            rules={[
              {
                required: true,
                message: "Please input your Commands Category name!",
              },
            ]}
          >
            <Input placeholder="Enter Commands Category Name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddCommandsCategoryModal;
