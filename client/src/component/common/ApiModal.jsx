import { Modal, Form, Input, Divider } from 'antd';
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';

export const IntegrateAppsModal = ({ propsData }) => {
  const { title, open, onCancel, onOk, okText, formItems, form } = propsData;

  
  if (!Array.isArray(formItems)) {
    console.error('Expected formItems to be an array, but got:', formItems);
    return null;
  }

 
  const initialValues = {};
  formItems.forEach((item) => {
    initialValues[item.name] = item.initialValue || '';
  });


  const filterUniqueFields = (fields) => {
    const seen = new Set();
    return fields.filter((item) => {
      if (!item.name || seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
  };

  let authFields = [];
  let headerFields = [];
  let otherFields = [];

  if (formItems.length > 0) {
    authFields = filterUniqueFields(
      formItems.filter((item) => item.group === 'authFields')
    );
    headerFields = filterUniqueFields(
      formItems.filter((item) => item.group === 'headers')
    );
    otherFields = filterUniqueFields(
      formItems.filter(
        (item) =>
          !item.group ||
          (item.group !== 'authFields' && item.group !== 'headers')
      )
    );
  }

  // Handle submit
  const handleFinish = (values) => {
    onOk(values);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel(); 
  };

  const renderInputComponent = (item, group) => {
    const isPassword =
      item.type === 'password' || item.name.toLowerCase().includes('password');


    const uniqueName = `${group}_${item.name}`;

    return isPassword ? (
      <Input.Password
        id={`password_${group}`}
        name={uniqueName}
        placeholder={`Enter ${item.label}`}
        disabled={item.disabled}
        iconRender={(visible) =>
          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
        }
      />
    ) : (
      <Input
        name={uniqueName}
        placeholder={`Enter ${item.label}`}
        disabled={item.disabled}
      />
    );
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText={okText}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        {/* Authentication Fields */}
        {authFields.length > 0 && (
          <>
            <Divider orientation="left">Authentication Fields</Divider>
            {authFields.map((item) => (
              <Form.Item
                key={item.name}
                name={`${'authFields'}_${item.name}`} // Add group prefix
                label={item.label}
                rules={item.rules}
                initialValue={item.initialValue}
              >
                {renderInputComponent(item, 'authFields')}
              </Form.Item>
            ))}
          </>
        )}

        {/* Header Fields */}
        {headerFields.length > 0 && (
          <>
            <Divider orientation="left">Header Fields</Divider>
            {headerFields.map((item) => (
              <Form.Item
                key={item.name}
                name={`${'headers'}_${item.name}`} // Add group prefix
                label={item.label}
                rules={item.rules}
                initialValue={item.initialValue}
              >
                {renderInputComponent(item, 'headers')}
              </Form.Item>
            ))}
          </>
        )}

        {/* Other Fields */}
        {otherFields.length > 0 && (
          <>
            <Divider orientation="left">Other Fields</Divider>
            {otherFields.map((item) => (
              <Form.Item
                key={item.name}
                name={`${'other'}_${item.name}`} // Add group prefix
                label={item.label}
                rules={item.rules}
                initialValue={item.initialValue}
              >
                {renderInputComponent(item, 'other')}
              </Form.Item>
            ))}
          </>
        )}
      </Form>
    </Modal>
  );
};