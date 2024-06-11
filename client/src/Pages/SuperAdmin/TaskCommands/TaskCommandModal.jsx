import { Modal, Form, Input, Select, Row, Col, Button, message } from "antd";
import { useEffect, useState } from "react";
import AddCommandsCategoryModal from "./AddCommandsCategoryModal";
import { createCategory,getCategories } from "../../../api/taskCommandsCategory.js";
const { Option } = Select;

const TaskCommandModal = ({ propsData }) => {
  //------------------- States ---------------------
  const { open, setOpen, actions, mode, data } = propsData;
  const [form] = Form.useForm();
  const [addCommandsCategoryModalOpen, setAddCommandsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const noChange = "No changes made to update";

  useEffect(() => {
    if (mode === "edit" && open) {
      form.setFieldsValue({
        label: data?.commands?.label,
        icon: data?.commands?.icon,
        commandsCategoryName: data?.commandsCategoryName,
      });
    }
  }, [mode, open, data, form]);

  //--------------------- Side Effects -------------------
  useEffect(() => {
    handleFetchCategories();
  }, []);

  //----------------------- API Calls --------------------
  const handleFetchCategories = async () => {
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddTaskCommandCategory = async (reqBody) => {
    try {
      const { data, success, error } = await createCategory(reqBody, handleFetchCategories, setLoading);
      if (data) {
        message.success(success);
      } else {
        message.error(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // -------------------- Local Functions -------------------
  const showAddCommandsCategoryModal = () => {
    setAddCommandsCategoryModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        if (mode === "edit") {
          const initialValues = {
            label: data?.commands?.label,
            icon: data?.commands?.icon,
            commandsCategoryName: data?.commandsCategoryName,
          };
  
          if (JSON.stringify(initialValues) === JSON.stringify(values)) {
            message.info(noChange);
            return;
          }
  
          const selectedCategory = categories.find(category => category.commandsCategoryName === values.commandsCategoryName);
  
          if (selectedCategory) {
            values.commandsCategoryName = selectedCategory._id;
          }
  
          actions.handleTaskCommandEdit(values);
        } else {
          actions.handleCreateTaskCommand(values);
        }
        setOpen(false);
        form.resetFields();
      })
      .catch((errorInfo) => {
        console.log("Validation failed:", errorInfo);
      });
  };

  return (
    <div>
      <Modal
        open={open}
        onOk={handleOk}
        okText={mode === "create" ? "Create" : "Update"}
        onCancel={handleCancel}
        title={mode === "create" ? "Create Task Command" : "Edit Task Command"}
      >
        <Form form={form} layout="vertical" name="basicForm">
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                label="Label"
                name="label"
                rules={[
                  {
                    required: true,
                    message: "Please input your task command label!",
                  },
                ]}
              >
                <Input placeholder="Enter task command label" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <span>
                    Icon{" "}
                    <span className="text-primary">
                      [ use ONLY Ant Design, React Ant Icons, React Flat Icons,
                      React Font Awesome Five, React Font Awesome Six icons ]
                    </span>
                    <br />
                    Example: ReadOutlined
                  </span>
                }
                name="icon"
                rules={[
                  {
                    required: true,
                    message: "Please input your task command icon!",
                  },
                ]}
              >
                <Input placeholder="Enter task command icon" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="commandsCategoryName"
                label="Select Command Category"
                rules={[
                  {
                    required: true,
                    message: "Please select a Command Category!",
                  },
                ]}
              >
                <Select placeholder="Select a Command Category">
                  {categories?.map((category) => (
                    <Option key={category._id} value={category._id}>
                      {category.commandsCategoryName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Add Command Category">
                <Button
                  className="w-100"
                  onClick={showAddCommandsCategoryModal}
                >
                  + Command Category
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Add Commands Category Modal */}
      <AddCommandsCategoryModal
        dataProps={{
          open: addCommandsCategoryModalOpen,
          setOpen: setAddCommandsCategoryModalOpen,
          actions: {
            handleAddTaskCommandCategory,
          },
        }}
      />
    </div>
  );
};

export default TaskCommandModal;
