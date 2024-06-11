import { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { InputModal } from '../../component/common/InputModal';
import "./EditAssistantTypeFormFields";
import { EditAssistantTypeFormData } from './EditAssistantTypeFormFields';
const EditAssistantTypeModal = ({ propsData }) => {
  const { open, setOpen, data, actions } = propsData;
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ name: data });
    }
  }, [open, data, form]);

  const handleUpdate = () => {
    form.validateFields()
      .then(() => {
        const updatedData = form.getFieldsValue();
        actions.handleAssistantTypeEdit(updatedData);
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
    <InputModal
      propsData={{
        title: "Edit Assistant Type",
        data: data,
        placeholder:'',
        open: open,
        onCancel: handleCancel,
        onOk: handleUpdate,
        okText: "Update",
        formItems: EditAssistantTypeFormData,
        form: form 
      }}
    />
  );
};

export default EditAssistantTypeModal;
