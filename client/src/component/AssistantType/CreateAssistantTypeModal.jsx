import React from 'react'
import { Modal, Form, Input } from 'antd';
import { InputModal } from '../common/InputModal';
import { AddAssistantTypeFormData } from './CreateAssistantTypeFormFields';
const CreateAssistantTypeModal = ({ dataProps }) => {
    const { open, setOpen, actions } = dataProps;
    const [form] = Form.useForm();

    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                actions.handleCreateAssistantType(values?.assistantType)
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

            <InputModal
                propsData={{
                    title: "Add Agent Type",
                    data: null,
                    placeholder: "Add Agent Type Here",
                    open: open,
                    onCancel: handleCancel,
                    onOk: handleOk,
                    okText: "Create",
                    formItems: AddAssistantTypeFormData,
                    form: form
                }}
            />
        </div>
    )
}

export default CreateAssistantTypeModal;

