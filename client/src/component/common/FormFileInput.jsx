import { useState, useEffect } from 'react';
import { Upload, Button, Form } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const FormFileInput = ({ label, name, multiple, className, resetTrigger }) => {
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (resetTrigger) {
      setFileList([]);
    }
  }, [resetTrigger]);

  const handleChange = ({ fileList }) => setFileList(fileList);

  return (
    <Form.Item name={name} className={className} >
      <Upload 
        multiple={multiple}
        fileList={fileList}
        beforeUpload={() => false}
        onChange={handleChange}
      >
        <Button icon={<UploadOutlined />}>{label}</Button>
      </Upload>
    </Form.Item>
  );
}

export default FormFileInput;