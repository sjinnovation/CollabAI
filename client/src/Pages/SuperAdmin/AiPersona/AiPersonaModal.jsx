import { Modal, Form, Input, Select, Row, Col, Button, message, Upload, Checkbox  } from "antd";
import { useEffect, useState } from "react";
import instructionsImage from "./../../../assests/images/Instructions_placeholder.png";

const AiPersonaModal = ({ propsData }) => {
    //------------------- States ---------------------
    const { open, setOpen, actions, mode, data } = propsData;
    const [form] = Form.useForm();
    const [addCommandsCategoryModalOpen, setAddCommandsCategoryModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentAvatar, setCurrentAvatar] = useState(null);
    const noChange = "No changes made to update";

    console.log("Data on Modal to Edit :", data)
  
    useEffect(() => {
      if (mode === "edit" && open) {
        form.setFieldsValue({
          personaName: data?.personaName,
          avatar: data?.avatar,
          description: data?.description,
          isFeatured: data?.isFeatured || false,
        });
        setCurrentAvatar(data?.avatar);
      }
    }, [mode, open, data, form]);
  
    //--------------------- Side Effects -------------------
    // useEffect(() => {
    //   handleFetchCategories();
    // }, []);
  
    //----------------------- API Calls --------------------
    // const handleFetchCategories = async () => {
    //   try {
    //     const { data } = await getCategories();
    //     setCategories(data);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
  
    // const handleAddTaskCommandCategory = async (reqBody) => {
    //   try {
    //     const { data, success, error } = await createCategory(reqBody, handleFetchCategories, setLoading);
    //     if (data) {
    //       message.success(success);
    //     } else {
    //       message.error(error);
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
  
    // -------------------- Local Functions -------------------
    // const showAddCommandsCategoryModal = () => {
    //   setAddCommandsCategoryModalOpen(true);
    // };

    useEffect(() => {
      if (mode === "create" && open) {
        form.resetFields();
        setCurrentAvatar(null); 
      }
    }, [mode, open, form]);
  
    const handleCancel = () => {
      if (loading) return; 
      form.resetFields();
      setOpen(false);
    };
  
    const handleOk = () => {
      if (loading) return;
  
      form
        .validateFields()
        .then(async (values) => {
          const avatar = form.getFieldValue("avatar");
  
          let finalAvatar;
  
          if (avatar?.fileList?.[0]?.originFileObj) {
            // Case 1: New image uploaded
            finalAvatar = avatar.fileList[0].originFileObj;
          } else if (mode === "edit" && data?.avatar) {
            // Case 2: Editing and no new image uploaded — use existing one
            finalAvatar = data.avatar;
          } else {
            // Case 3: Creating and no image uploaded — use default
            const response = await fetch(instructionsImage);
            const blob = await response.blob();
            finalAvatar = new File([blob], "Instructions_placeholder.png", { type: "image/png" });
          }
  
          const finalValues = {
            ...values,
            avatar: finalAvatar,
          };
  
          setLoading(true);
          
          try {
            if (mode === "edit") {
              actions.handleAiPersonaEdit(finalValues);
            } else {
              actions.handleCreateAiPersona(finalValues);
              form.resetFields();
              setCurrentAvatar(null); 
            }
            setOpen(false);
          } catch (error) {
            console.error("Error:", error);
            message.error("An error occurred");
          } finally {
            setLoading(false);
          }
        })
        .catch((errorInfo) => {
          console.log("Validation failed:", errorInfo);
        });
    };
  
    return (
      <div>
      <Modal
        centered
        open={open}
        onOk={handleOk}
        okText={mode === "create" ? "Create" : "Update"}
        onCancel={handleCancel}
        title={mode === "create" ? "Create Instructions" : "Edit Instructions"}
        confirmLoading={loading}
        maskClosable={!loading}
        closable={!loading}
        okButtonProps={{ loading: loading }}
        cancelButtonProps={{ disabled: loading }}
      >
          <Form form={form} layout="vertical" name="personaForm">
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                label="Name"
                name="personaName"
                rules={[
                  {
                    required: true,
                    message: "Please input your Ai Persona Name",
                  },
                ]}
              >
                <Input placeholder="Enter Ai Persona Name" disabled={loading} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Upload Photo"
                name="avatar"
                // Made optional like in UserAiPersonaModal
              >
                {currentAvatar && (
                  <img
                    style={{
                      height: "100px",
                      width: "100px",
                      marginBottom: "5px",
                      borderRadius: "7px",
                      border: "1px solid black",
                    }}
                    src={currentAvatar}
                    alt="Uploaded"
                  />
                )}
                <Upload
                  maxCount={1}
                  accept="image/*"
                  disabled={loading}
                  beforeUpload={(file) => {
                    const isImage = file.type.startsWith("image/");
                    if (!isImage) {
                      message.error("You can only upload image files!");
                      return false;
                    }
                    // Store the file object directly and update currentAvatar
                    const fileUrl = URL.createObjectURL(file);
                    setCurrentAvatar(fileUrl);
                    form.setFieldsValue({
                      avatar: { file, fileList: [{ originFileObj: file }] },
                    });
                    return false;
                  }}
                >
                  <Button disabled={loading}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="isFeatured" valuePropName="checked">
                <Checkbox disabled={loading}>Featured</Checkbox>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Instructions"
                name="description"
                rules={[
                  {
                    required: true,
                    message: "Please input your Instruction!",
                  },
                ]}
              >
                <Input.TextArea 
                  placeholder="Enter your Instruction" 
                  rows={4}
                  disabled={loading}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        </Modal>
  
        {/* Add Commands Category Modal */}
        {/* <AddCommandsCategoryModal
          dataProps={{
            open: addCommandsCategoryModalOpen,
            setOpen: setAddCommandsCategoryModalOpen,
            actions: {
              handleAddTaskCommandCategory,
            },
          }}
        /> */}
      </div>
    );
  };

export default AiPersonaModal;