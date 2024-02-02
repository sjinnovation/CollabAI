import { Modal, Form, Input } from 'antd';

const CreateTagModal = ({propsData}) => {
    const {open, setOpen, actions} = propsData;
    const [form] = Form.useForm();

    const handleOk = () => {
        form
          .validateFields()
          .then((values) => {
            console.log('Form values:', values);
            actions.handleCreateTag(values)
            form.resetFields();
            setOpen(false);
          })
          .catch((errorInfo) => {
            console.log('Validation failed:', errorInfo);
          });
      };

    const handleCancel =()=>{
        setOpen(false)
    }
  return (
    <div>
      <Modal
      open={open}
      onOk={handleOk}
      okText='Create'
      onCancel={handleCancel}
      title= "Create Tag"
      >
      <Form form={form} layout="vertical" name="basicForm">
          <Form.Item
            label="Tag Title"
            name="meetingTitle"
            rules={[
              {
                required: true,
                message: 'Please input your tag!',
              },
            ]}
          >
            <Input placeholder="Enter Tag Title" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CreateTagModal;
