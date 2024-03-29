import { Modal, Form, Input,} from 'antd';

const EditTeamModal = ({propsData}) => {
    const { open, setOpen, data, actions } = propsData;
    
    const [form] = Form.useForm();
    form.setFieldsValue(data);

    const handleUpdate = () => {
    form.validateFields()
          .then(() => {
            const updatedData = form.getFieldsValue();
              actions.handleTeamEdit(updatedData)
              setOpen(false)
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
    <Modal
      title="Edit Team"
      open={open}
      onCancel={handleCancel}
      onOk={handleUpdate}
      okText= "Update"
      
    >
      <div>
       <Form form={form} layout="vertical">
        <Form.Item 
        name="teamTitle" 
        label="Team Name"
        rules={[
            {
              required: true,
              message: 'Please input your team name!',
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
      </div>
    </Modal>
    );
};

export default EditTeamModal;