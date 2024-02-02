import { Form, Input } from 'antd';
const { TextArea } = Input;

const FormTextArea = ({ name, rows, placeholder, maxLength, showCount }) => (
    <Form.Item name={name} >
        <TextArea
            showCount={showCount} 
            rows={rows} 
            placeholder={placeholder} 
            maxLength={maxLength}
        />
    </Form.Item>
);

export default FormTextArea;