import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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

import { getUserID } from "../../Utility/service";
import {
  getSingleFunctionDefinitions,
  handleEditFunctionToDB,
  handleValidateFunction,
  renderParameterInputs,
} from "../SuperAdmin/api/functionDefinition";

import CommonPageLayout from "../../component/layout/CommonStructure/CommonPageLayout";
import ProfileHeader from "../../component/Proflie/ProfileHeader";
import ValidationModel from "../SuperAdmin/Modals/ValidationModel";

const { TextArea } = Input;

const EditFunction = () => {
  const { function_id } = useParams();
  const navigate = useNavigate();
  const backTarget = useLocation().state?.from ?? -1;
  const userId = getUserID();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState([]);
  const [required, setRequired] = useState([]);
  const [paramRequired, setParamRequired] = useState(false);

  const [showValidation, setShowValidation] = useState(false);
  const [validateConsole, setValidateConsole] = useState("");
  const [parameterValues, setParameterValues] = useState({});

  const toggleValidation = () => setShowValidation((prev) => !prev);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const all = await getSingleFunctionDefinitions(userId, "");
        const data = all.find((func) => func._id === function_id);
        if (!data) {
          message.error("Function not found");
          navigate(backTarget);
          return;
        }

        form.setFieldsValue({
          title: data.title,
          name: data.name,
          instruction: data.instruction,
          description: data.description,
          functionDefinition: data.definition,
        });

        const properties = data.parameters?.properties || {};
        setParams(
          Object.entries(properties).map(([key, val]) => ({
            name: key,
            type: val.type,
            description: val.description,
          }))
        );
        setRequired(data.parameters?.required || []);
      } catch (err) {
        console.error(err);
        message.error("Failed to load function");
      } finally {
        setLoading(false);
      }
    })();
  }, [function_id, userId, form, navigate, backTarget]);

  useEffect(() => {
    const updateFunctionDefinition = () => {
      const currentDefinition = form.getFieldValue("functionDefinition") || "";
      const signatureMatch = currentDefinition.match(
        /function\s+(\w+)\s*\(([^)]*)\)/
      );
      const functionName = signatureMatch ? signatureMatch[1] : "functionName";
      const bodyMatch = currentDefinition.match(/\)\s*{[\s\S]*}/);
      const body = bodyMatch
        ? bodyMatch[0].replace(/^\)\s*/, "")
        : "{ // Write your Function Logic }";
      const paramList = params.map((p) => p.name).join(", ");
      const newDefinition = `function ${functionName}(${
        paramList || ""
      }) ${body}`;
      form.setFieldsValue({ functionDefinition: newDefinition });
    };

    updateFunctionDefinition();
  }, [params, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!params.length) {
        message.error("Please add at least one parameter.");
        return;
      }

      const properties = {};
      params.forEach((p) => {
        properties[p.name] = { type: p.type, description: p.description };
      });

      await handleEditFunctionToDB(
        function_id,
        values.title,
        values.name,
        values.functionDefinition,
        values.instruction,
        values.description,
        { type: "object", properties, required },
        () => {},
        () => {},
        () => {},
        false
      );

      navigate(backTarget);
    } catch (err) {
      console.error(err);
    }
  };

  const breadcrumbs = [
    { label: "Home", url: "/" },
    { label: "Agents", url: "/myAgents" },
    ...(backTarget === "/myFunctions"
      ? [{ label: "My Functions", url: "/myFunctions" }]
      : backTarget === "/allFunctions"
      ? [{ label: "All Functions", url: "/allFunctions" }]
      : [{ label: "My Functions", url: "/myFunctions" }]),
    { label: "Edit Function", url: "" },
  ];

  return (
    <CommonPageLayout>
      <div className="edit-function-container">
        <ProfileHeader
          title="Edit Function"
          subHeading="Modify your custom AI function."
          breadcrumbs={breadcrumbs}
        />
        <Card loading={loading}>
          <Form layout="vertical" form={form}>
            <Form.Item
              label="Title"
              name="title"
              rules={[
                { required: true, message: "Enter a title" },
                {
                  pattern: /^[a-zA-Z][\w\s\-_.!,@#$%^&*()]{2,}$/,
                  message: "At least 3 chars; start with a letter.",
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
              rules={[{ required: true }]}
            >
              <TextArea rows={3} placeholder="Enter Instruction" />
            </Form.Item>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true }]}
            >
              <TextArea rows={3} placeholder="Enter Description" />
            </Form.Item>

            <Typography className="mb-2">Add Parameters</Typography>
            <div style={{ display: "flex", gap: 12 }}>
              <Form.Item name={["param", "name"]} style={{ flex: 1 }}>
                <Input placeholder="Parameter Name" />
              </Form.Item>
              <Form.Item name={["param", "type"]} style={{ width: "50%" }}>
                <Select placeholder="Type">
                  <Select.Option value="string">String</Select.Option>
                  <Select.Option value="number">Number</Select.Option>
                  <Select.Option value="boolean">Boolean</Select.Option>
                  <Select.Option value="array">Array</Select.Option>
                  <Select.Option value="object">Object</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <Form.Item name={["param", "description"]}>
              <TextArea rows={2} placeholder="Parameter Description" />
            </Form.Item>
            <Form.Item name={["param", "required"]} valuePropName="checked">
              <Checkbox onChange={(e) => setParamRequired(e.target.checked)}>
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
                } = form.getFieldValue("param") || {};
                if (!name || !type || !description) {
                  message.error("Fill all parameter fields");
                  return;
                }

                setParams((prev) => [
                  ...prev.filter((p) => p.name !== name),
                  { name, type, description },
                ]);

                if (req && !required.includes(name))
                  setRequired((r) => [...r, name]);
                if (!req) setRequired((r) => r.filter((x) => x !== name));

                form.resetFields(["param"]);
                setParamRequired(false);
              }}
            >
              Add / Update Parameter
            </Button>

            <Typography className="mt-3" strong>
              Parameters
            </Typography>
            <ul style={{ marginTop: 12 }}>
              {params.map((p) => (
                <li key={p.name}>
                  {p.name}{" "}
                  <MinusCircleOutlined
                    onClick={() => {
                      setParams((prev) =>
                        prev.filter((x) => x.name !== p.name)
                      );
                      setRequired((r) => r.filter((x) => x !== p.name));
                    }}
                    style={{ color: "crimson", cursor: "pointer" }}
                  />
                </li>
              ))}
            </ul>

            <Form.Item
              label="Function Definition"
              name="functionDefinition"
              rules={[{ required: true }]}
            >
              <TextArea rows={10} placeholder="function myFunc() { … }" />
            </Form.Item>

            <Form.Item>
              <Button type="link" onClick={toggleValidation}>
                Validate Function
              </Button>
            </Form.Item>

            <Form.Item>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  onClick={() => navigate(backTarget)}
                  style={{ marginRight: 8 }}
                >
                  Cancel
                </Button>
                <Button type="primary" onClick={handleSubmit}>
                  Update Function
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>

        <ValidationModel
          data={{
            showValidationModal: showValidation,
            toggleValidationModal: toggleValidation,
            renderParameterInputs,
            functionsParameterNames: params,
            parameterValues,
            setParameterValues,
            handleParameterChange: (e) =>
              setParameterValues((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              })),
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

export default EditFunction;
