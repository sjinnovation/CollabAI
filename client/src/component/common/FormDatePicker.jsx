import { Form, DatePicker } from 'antd';

const FormDatePicker = ({ name, label, rules, placeholder, className }) => (
  <Form.Item
    name={name}
    label={label}
    rules={rules}
    className={className}
    hasFeedback
  >
    <DatePicker
      style={{ width: "100%" }}
      picker="date"
      placeholder={placeholder}
    />
  </Form.Item>
);

export default FormDatePicker;