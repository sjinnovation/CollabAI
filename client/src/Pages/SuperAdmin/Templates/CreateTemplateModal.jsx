import { Modal, Form, Input, Select, Row, Col, Button, } from 'antd';
import { useEffect } from 'react';
import { useState } from 'react';
import AddCategoryModal from './AddCategoryModal';
import { getUserID } from '../../../Utility/service';
import { createCategory, getCategories } from '../../../api/templatesCategory';
const { TextArea } = Input;
const { Option } = Select;

const CreateTemplateModal = ({ propsData }) => {

    //------------------- States ---------------------
    const { open, setOpen, actions, } = propsData;
    const [form] = Form.useForm();
    const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(false);
    const userid = getUserID();


    const handleOk = () => {
        form
            .validateFields()
            .then((values) => {
                console.log('Form values:', values);
                actions.handleCreateTemplate(values)
                form.resetFields();
                setOpen(false);
            })
            .catch((errorInfo) => {
                console.log('Validation failed:', errorInfo);
            });
    };

    //--------------------- Side Effects -------------------

    useEffect(() => {
        handleFetchCategories();
    }, []);

    //----------------------- API Calls --------------------

    const handleFetchCategories = async () => {
        try {
          const { success, data, error } = await getCategories(setCategories);
          setCategories(data);
        
          if (!success) {
            
            console.log("Error fetching categories:", error);
          }
        } catch (error) {
          console.log(error);
        }
      };

      const handleAddTemplateCategory = async (reqBody) => {
        try {
          await createCategory(userid, reqBody, handleFetchCategories, setLoading);
        } catch (error) {
          console.log(error);
        }
      };

    

    // -------------------- Local Functions -------------------
    const showAddCategoryModal = () => {
        setAddCategoryModalOpen(true)
    }

    const handleCancel = () => {
        form.resetFields();
        setOpen(false)
    }

    return (
        <div>
            <Modal
                open={open}
                onOk={handleOk}
                okText='Create'
                onCancel={handleCancel}
                title="Create Template"
            >

                <Form form={form} layout="vertical" name="basicForm">
                    <Row gutter={12}>
                        <Col span={24}>
                            <Form.Item
                                label="Title"
                                name="template_title"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your template title!',
                                    },
                                ]}
                            >
                                <Input placeholder="Enter template Title" />


                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label="Description"
                                name="template_description"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your template description!',
                                    },
                                ]}
                            >
                                <TextArea rows={4} placeholder="Description" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="template_category"
                                label="Select Category"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select a category!',
                                    },
                                ]}
                            >
                                <Select
                                    placeholder="Select a category"
                                >
                                    {
                                        categories?.map(category => <Option
                                            key={category._id}
                                            value={category._id
                                            }
                                        >
                                            {category.category_name}
                                        </Option>)
                                    }


                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Add Category"
                            >
                                <Button style={{ width: "100%" }} onClick={showAddCategoryModal}> +  Category</Button>
                            </Form.Item>

                        </Col>
                    </Row>
                </Form>
            </Modal>

            {/* Add Category Modal  */}
            <AddCategoryModal
                dataProps={{
                    open: addCategoryModalOpen,
                    setOpen: setAddCategoryModalOpen,
                    actions: {
                        handleAddTemplateCategory
                    }
                }}
            />
        </div>
    )
}

export default CreateTemplateModal;
