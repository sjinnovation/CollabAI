import { Modal, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { useState } from 'react';
import { getCategories } from '../../../api/templatesCategory';
const { TextArea } = Input;
const { Option } = Select;

const EditTemplateModal = ({ propsData }) => {
    const [categories, setCategories] = useState([]);

    const { open, setOpen, actions, data } = propsData;
    const allData = {...data?.data?.template, ...data?.category}
    // console.log("All data:",allData)

    const [form] = Form.useForm();
    form.setFieldsValue(allData);
    

    const handleUpdate = () => {
        form.validateFields()
            .then(() => {
                const updatedData = form.getFieldsValue();
                  actions.handleTemplateEdit(updatedData)
                console.log("UpdatedData:", updatedData)
                setOpen(false)
            })
            .catch((errorInfo) => {
                console.log('Validation failed:', errorInfo);
            });
    };

    // ----------------- Side Effect ---------------

    useEffect(() => {
        handleFetchCategories()
    }, []);

    
   // ------------------ API Calls -----------------
   
    const handleFetchCategories = async () => {
        try {
          const { success, data, error } = await getCategories(setCategories);
          console.log(data)
          if (!success) {
            // Handle error
            console.log("Error fetching categories:", error);
          }
        } catch (error) {
          console.log(error);
        }
      };

    

    //------------------ Local Function -------------

    const handleCancel = () => {
        form.resetFields();
        setOpen(false)
    }

    // console.log("Data with Categories:", data)
    

    return (
        <div>
            <Modal
                open={open}
                onOk={handleUpdate}
                okText='Update'
                onCancel={handleCancel}
                title="Edit Template"
            >
                <Form form={form} layout="vertical" name="basicForm">
                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your template title!',
                            },
                        ]}
                    >
                        <Input placeholder="Enter template Title" />


                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your template description!',
                            },
                        ]}
                    >
                        <TextArea rows={4} placeholder="Description" />
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Select Category"
                        rules={[
                            {
                                required: true,
                                message: 'Please select a category!',
                            },
                        ]}
                    >
                        <Select
                            defaultValue={data?.category?.category_name}
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
                </Form>
            </Modal>
        </div>
    )
}

export default EditTemplateModal;
