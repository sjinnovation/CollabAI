import React from 'react'
import { Modal, Form, Input } from 'antd';

const AddCategoryModal = ({ dataProps }) => {
    const { open, setOpen, actions } = dataProps;
    const [form] = Form.useForm();

    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                console.log('Form values:', values);
                actions.handleAddTemplateCategory(values)
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
                title="Create Category"
                open={open}
                onOk={handleOk}
                okText="Create"
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical" name="basicForm">
                    <Form.Item
                        label="Category Name"
                        name="category_name"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your category name!',
                            },
                        ]}
                    >
                        <Input placeholder="Enter Category Name" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default AddCategoryModal
