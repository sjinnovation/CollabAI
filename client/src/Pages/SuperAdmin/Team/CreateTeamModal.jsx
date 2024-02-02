import React from 'react'
import { Modal, Form, Input } from 'antd';

const CreateTeamModal = ({dataProps}) => {
    const {open, setOpen, actions}= dataProps;
    const [form] = Form.useForm();

    const handleOk = () => {
        form
          .validateFields()
          .then((values) => {
            console.log('Form values:', values);
            actions.handleCreateTeam(values?.teamTitle)
            form.resetFields();
            setOpen(false);
          })
          .catch((errorInfo) => {
            console.log('Validation failed:', errorInfo);
          });
      };
    
  const handleCancel = () => {
        form.resetFields();
        setOpen(false);
  };

  return (
    <div>
       <Modal
        title="Create Team"
        open={open}
        onOk={handleOk}
        okText= "Create"
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" name="basicForm">
          <Form.Item
            label="Team Name"
            name="teamTitle"
            rules={[
              {
                required: true,
                message: 'Please input your team name!',
              },
            ]}
          >
            <Input placeholder="Enter Team Name" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CreateTeamModal;

