import { Modal, Form, Input, Row, Col, Button, Upload, message } from "antd";
import { useEffect } from "react";
import instructionsImage from "./../../../assests/images/Instructions_placeholder.png"


const UserAiPersonaModal = ({ propsData }) => {
    const { open, setOpen, actions, mode, data, loading } = propsData;
    const [form] = Form.useForm();

    useEffect(() => {
      if (mode === "edit" && open) {
        form.setFieldsValue({
          personaName: data?.personaName,
          avatar: data?.avatar,
          description: data?.description,
        });
      }
    }, [mode, open, data, form]);
  
    const handleCancel = () => {
      if (loading) return; // Prevent closing while loading
      form.resetFields();
      setOpen(false);
    };


    const handleOk = () => {
      if (loading) return;
    
      form
        .validateFields()
        .then(async (values) => {
          const avatar = form.getFieldValue('avatar');
    
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
            avatar: finalAvatar
          };
    
          if (mode === "edit") {
            actions.handleAiPersonaEdit(finalValues);
          } else {
            actions.handleCreateAiPersona(finalValues);
            form.resetFields();
          }
        })
        .catch((errorInfo) => {
          console.log("Validation failed:", errorInfo);
        });
    };
    

    useEffect(() => {
        if(mode === 'create') {
          form.resetFields();
        }
    }, [mode])
  
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
          <Form form={form} layout="vertical" name="userPersonaForm">
            <Row gutter={12}>
              <Col span={24}>
                <Form.Item
                  label="Name"
                  name="personaName"
                  rules={[
                    {
                      required: true,
                      message: "Please input your Persona Name",
                    },
                  ]}
                >
                  <Input placeholder="Enter Persona Name" disabled={loading} />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label="Upload Photo"
                  name="avatar"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Please upload a photo",
                  //   },
                  // ]}
                >
                  {data?.avatar && (
                    <img 
                      style={{ 
                        height: "100px", 
                        width: "100px", 
                        marginBottom: "5px", 
                        borderRadius: "7px", 
                        border: "1px solid black" 
                      }} 
                      src={data?.avatar} 
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
                      // Store the file object directly
                      form.setFieldsValue({ avatar: { file, fileList: [{ originFileObj: file }] } });
                      return false;
                    }}
                  >
                    <Button disabled={loading}>Upload Photo</Button>
                  </Upload>
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
                    placeholder="Enter your instruction" 
                    rows={4}
                    disabled={loading}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  };

export default UserAiPersonaModal; 