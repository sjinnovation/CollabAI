import { Modal, Form, Input } from 'antd';

const EditTagModal = ({ propsData }) => {
    const { open, setOpen, data, actions } = propsData;

    const [form] = Form.useForm();
    form.setFieldsValue(data);
    

    const handleUpdate = () => {
        form.validateFields()
            .then(() => {
                const updatedData = form.getFieldsValue();
                actions.handleTagEdit(updatedData)
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
        <div>
            <Modal
                title="Edit Tag"
                open={open}
                onCancel={handleCancel}
                onOk={handleUpdate}
                okText="Update"

            >

                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Tag Name"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your tag name!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>

            </Modal>
        </div>
    )
}

export default EditTagModal
