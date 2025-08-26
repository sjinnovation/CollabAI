import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Button,
  Checkbox,
  Typography,
  Card,
  message,
} from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";
import CommonPageLayout from "../../component/layout/CommonStructure/CommonPageLayout";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import { getUserID } from "../../Utility/service";
import {
  handleSaveFunctionToDB,
  handleValidateFunction,
  renderParameterInputs,
} from "../SuperAdmin/api/functionDefinition";
import ValidationModel from "../SuperAdmin/Modals/ValidationModel";

const { TextArea } = Input;

const CreateFunction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const backTarget = location.state?.from ?? -1;
  const userId = getUserID();
  const [form] = Form.useForm();

  const [functionsParameterNames, setFunctionsParameterNames] = useState([]);
  const [required, setRequired] = useState([]);
  const [paramRequired, setParamRequired] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validateConsole, setValidateConsole] = useState("");
  const [parameterValues, setParameterValues] = useState({});

  const toggleValidationModal = () => setShowValidationModal((prev) => !prev);

  const handleCancel = () => navigate(backTarget);
  const handleSuccess = () => navigate(backTarget);

  const toCamelCase = (str = "") =>
    str
      .split(" ")
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w[0]?.toUpperCase() + w.slice(1).toLowerCase()
      )
      .join("");

  const watchName = Form.useWatch("name", form);
  useEffect(() => {
    const template = `function ${
      watchName || "FunctionName"
    }(${functionsParameterNames
      .map((p) => toCamelCase(p.name.replace(/'/g, "")))
      .join(", ")}) {
  try {
    // Write your function logic
    return 1;
  } catch (error) {
    console.log(error);
  }
}`;
    form.setFieldsValue({ functionDefinition: template });
  }, [watchName, functionsParameterNames, form]);

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      if (!functionsParameterNames.length) {
        message.error("Please add at least one parameter.");
        return;
      }

      const properties = {};
      functionsParameterNames.forEach((param) => {
        properties[param.name] = {
          type: param.type,
          description: param.description,
        };
      });

      await handleSaveFunctionToDB(
        values.title,
        values.name,
        values.functionDefinition,
        values.instruction,
        values.description,
        { type: "object", properties, required },
        () => {},
        () => {},
        () => {},
        false,
        userId
      );

      handleSuccess();
    } catch (err) {
      if (err) console.error(err);
    }
  }

  return (
    <CommonPageLayout>
      <div className="create-function-container">
        <ProfileHeader
          title="Create Functions"
          subHeading="Create your own custom AI functions."
          breadcrumbs={[
            { label: "Home", url: "/" },
            { label: "Agents", url: "/myAgents" },
            { label: "My Functions", url: "/myFunctions" },
            { label: "Create Functions", url: "" },
          ]}
        />
        <Card>
          <Form layout="vertical" form={form}>
            <Form.Item
              label="Title"
              name="title"
              rules={[
                { required: true, message: "Please enter title" },
                {
                  pattern: /^[a-zA-Z][\w\s\-_.,!@#$%^&*()]{2,}$/,
                  message:
                    "Title should start with an letter and can contain letters and special characters. (e.g., Google Sheet Fetch)",
                },
              ]}
            >
              <Input placeholder="Enter Title" />
            </Form.Item>

            <Form.Item
              label="Function Name"
              name="name"
              rules={[
                { required: true, message: "Please enter function name" },
                {
                  pattern: /^[a-zA-Z]{3,}$/,
                  message:
                    "Function name should start with an alphabet and at least 3 characters. No whitespaces or special characters. (e.g., googleSheetFetch)",
                },
              ]}
            >
              <Input placeholder="Enter Function Name" />
            </Form.Item>

            <Form.Item
              label="Instruction"
              name="instruction"
              rules={[
                {
                  required: true,
                  message: "Please enter function's instruction",
                },
              ]}
            >
              <TextArea rows={3} placeholder="Enter Instruction" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Please enter function's description",
                },
              ]}
            >
              <TextArea rows={3} placeholder="Enter Description" />
            </Form.Item>

            <Typography className="mb-2">Add Parameters</Typography>
            <div style={{ display: "flex", gap: 12 }}>
              <Form.Item
                name={["parameter", "name"]}
                style={{ flex: 1, marginBottom: 8 }}
              >
                <Input placeholder="Parameter Name" />
              </Form.Item>

              <Form.Item
                name={["parameter", "type"]}
                style={{ width: "50%", marginBottom: 8 }}
              >
                <Select placeholder="Select Parameter Type">
                  <Select.Option value="string">String</Select.Option>
                  <Select.Option value="number">Number</Select.Option>
                  <Select.Option value="boolean">Boolean</Select.Option>
                  <Select.Option value="array">Array</Select.Option>
                  <Select.Option value="object">Object</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item name={["parameter", "description"]}>
              <TextArea rows={2} placeholder="Parameter Description" />
            </Form.Item>

            <Form.Item name={["parameter", "required"]}>
              <Checkbox
                checked={paramRequired}
                onChange={(e) => setParamRequired(e.target.checked)}
              >
                Required
              </Checkbox>
            </Form.Item>

            <Button
              block
              type="dashed"
              onClick={() => {
                const {
                  name,
                  type,
                  description,
                  required: req,
                } = form.getFieldValue("parameter") || {};

                if (!name || !type || !description) {
                  message.error("Fill all parameter fields");
                  return;
                }

                setFunctionsParameterNames((prev) => [
                  ...prev,
                  { name, type, description },
                ]);
                if (req) setRequired((prev) => [...prev, name]);

                form.setFieldValue(["parameter", "name"], "");
                form.setFieldValue(["parameter", "type"], undefined);
                form.setFieldValue(["parameter", "description"], "");
                setParamRequired(false);
              }}
            >
              Add Parameter
            </Button>

            <Typography className="mt-3" strong>
              Created Parameters
            </Typography>
            <ul style={{ marginTop: 12 }}>
              {functionsParameterNames.map((p) => (
                <li key={p.name}>
                  {p.name}{" "}
                  <MinusCircleOutlined
                    onClick={() => {
                      setFunctionsParameterNames((prev) =>
                        prev.filter((x) => x.name !== p.name)
                      );
                      setRequired((prev) => prev.filter((x) => x !== p.name));
                    }}
                    style={{ color: "crimson", cursor: "pointer" }}
                  />
                </li>
              ))}
            </ul>

            <Form.Item
              label="Function Definition"
              name="functionDefinition"
              rules={[{ required: true, message: "Enter function code" }]}
            >
              <TextArea rows={10} placeholder="function myFunc() { ... }" />
            </Form.Item>

            <Form.Item>
              <Button type="link" onClick={toggleValidationModal}>
                Validate Function
              </Button>
            </Form.Item>

            <Form.Item>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                  Cancel
                </Button>
                <Button type="primary" onClick={handleSubmit}>
                  Create Function
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>

        <ValidationModel
          data={{
            showValidationModal,
            toggleValidationModal,
            renderParameterInputs,
            functionsParameterNames,
            parameterValues,
            setParameterValues,
            handleParameterChange: (e) =>
              setParameterValues({
                ...parameterValues,
                [e.target.name]: e.target.value,
              }),
            validateConsole,
            handleValidateFunction,
            setValidateConsole,
            functionDefinition: form.getFieldValue("functionDefinition"),
            functionName: form.getFieldValue("name"),
          }}
        />
      </div>
    </CommonPageLayout>
  );
};

export default CreateFunction;
