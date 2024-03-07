import { useState, useEffect } from "react";
import { Form } from "antd";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import FormDatePicker from "./FormDatePicker";
import FormCheckbox from "./FormCheckbox";
import FormEmail from "./FormEmail";
import FormButton from "./FormButton";
import FormTextArea from "./FormTextArea";
import FormFileInput from "./FormFileInput";
import MultiSelect from "./MultiSelect";

const FormComponent = ({
  title,
  formItems,
  layout,
  className,
  handleSubmit,
  defaultValues,
}) => {
  const [form] = Form.useForm();
  const [resetTrigger, setResetTrigger] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      form.setFieldsValue(defaultValues);
    }
  }, [defaultValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (values.upload) {
        values.files = values.upload.fileList;
        delete values.upload;
        setResetTrigger(!resetTrigger);
      }
      await handleSubmit(values);
      setTimeout(() => {
        form.resetFields();
      }, 1000);
    } catch (info) {
      console.log("Validate Failed:", info);
    }
  };

  return (
    <>
      {title && <h1 className="form-title">{title}</h1>}
      <Form
        form={form}
        autoComplete="off"
        layout={layout}
        className={className}
        initialValues={defaultValues ? defaultValues : {}}
      >
        {formItems.map((item, index) => {
          switch (item.type) {
            case "text":
              return <FormInput key={index} {...item} />;
            case "email":
              return <FormEmail key={index} {...item} />;
            case "password":
              return <FormInput key={index} {...item} />;
            case "select":
              return <FormSelect key={index} {...item} />;
            case "multiselect":
              return <MultiSelect key={index} {...item} />;
            case "datePicker":
              return (
                <FormDatePicker
                  key={index}
                  {...item}
                  value={form.getFieldValue(item.name)}
                  onChange={(value) =>
                    form.setFieldsValue({ [item.name]: value })
                  }
                />
              );
            case "checkbox":
              return <FormCheckbox key={index} {...item} />;
            case "textArea":
              return <FormTextArea key={index} {...item} />;
            case "fileUpload":
              return (
                <FormFileInput
                  key={index}
                  {...item}
                  resetTrigger={resetTrigger}
                />
              );
            case "submit":
              return (
                <div className="d-flex justify-content-end">
                  <FormButton
                    key={index}
                    {...item}
                    onClick={handleOk}
                  />
                </div>
              );
            case "submitreset":
              return (
                <div className="d-flex justify-content-end">
                  <FormButton
                    label={item.resetlabel}
                    key={index}
                    {...item}
                    onClick={() => form.resetFields()}
                  />
                  <FormButton
                    label={item.submitlabel}
                    buttonType="primary"
                    key={index}
                    {...item}
                    onClick={handleOk}
                  />
                </div>
              );
            default:
              return null;
          }
        })}
      </Form>
    </>
  );
};

export default FormComponent;
