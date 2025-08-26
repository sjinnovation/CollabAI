import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Button, InputNumber, message, Select, Radio } from 'antd';
import { getUserID } from '../../Utility/service';
import { axiosSecureInstance } from '../../api/axios';
import { getWorkBoardActionItems } from '../../api/workBoard';
import { FileContext } from '../../contexts/FileContext';
import { WORKBOARD_ACTION_ITEM_KNOWLEDGE_BASE_SLUG, WORKBOARD_SINGLE_ACTION_ITEM_KNOWLEDGE_BASE_SLUG } from '../../constants/Api_constants';


const userId = getUserID();
export const WorkBoardForm = ({ form, SubmitText, setIsAddActionItem, setIsActionItemSyncing, url, setBaseUrlOfWBforSync, setIsLoading, syncingRecordId, setSyncingRecordId ,parentId = null}) => {

    const [loading, setLoading] = useState(false);
    const [selectedApp, setSelectedApp] = useState("");
    const [appFileList, setAppFileList] = useState([]);
    const [wbFrom, setWbFrom] = useState('url');
    const [inputUrl, setInputUrl] = useState('');

    const { workBoardToken, setWorkBoardToken, selectedFileAppWithFileId, setSelectedFileAppWithFileId } = useContext(FileContext);

    useEffect(() => {
        form.resetFields();
    }, [SubmitText, url, form]);
    useEffect(() => {
        if (workBoardToken !== '' && workBoardToken !== null && workBoardToken !== undefined) {
            getWorkBoardActionItems().then(response => {
                if (response !== '') {
                    setAppFileList(response);
                }
            });
        } else {
            setAppFileList([]);
            message.error("Please Connect Your WorkBoard");
        }

    }, []);

    const handleFileNameChange = (fileId) => {
        form.setFieldsValue({ actionItem: fileId });
        const selectedFile = fileNameLists.find(option => option.value === fileId);
        const fileName = selectedFile ? selectedFile.label : '';
        setSelectedFileAppWithFileId({
            "appName": selectedApp,
            "fileIdOrUrl": fileId,
            "fileName": fileName,
        })
        return
    }
    let fileNameLists = [];
    fileNameLists = [
        ...(appFileList.personal ? appFileList.personal.map((file) => ({
            label: file.description,
            value: file.url,
        })) : []),
        ...(appFileList.inLoop ? appFileList.inLoop.map((file) => ({
            label: file.description,
            value: file.url,
        })) : []),
    ];
    const onFinish = async (values) => {
        try {
            setLoading(true);
            const selectedFile = fileNameLists.find(option => option.value === values.actionItem);
            const fileName = selectedFile ? selectedFile.label : '';
            let urlFromInput = null
            if (values.actionItem) {
                urlFromInput = values.actionItem
            } else if (values.inputUrl) {
                urlFromInput = values.inputUrl;
            }
            const workBoardRequestBody = {
                name: fileName ? fileName : '',
                url: SubmitText === "Sync" ? url : urlFromInput,
                userId: userId,
                parentId: parentId,
            }
            const response = SubmitText === "Sync" ? await axiosSecureInstance.get(WORKBOARD_SINGLE_ACTION_ITEM_KNOWLEDGE_BASE_SLUG(syncingRecordId)) : await axiosSecureInstance.post(WORKBOARD_ACTION_ITEM_KNOWLEDGE_BASE_SLUG(), workBoardRequestBody);
            if (response.status === 200) {
                setIsAddActionItem(false);
                setIsActionItemSyncing(false);
                setBaseUrlOfWBforSync('');
                setLoading(false);
                setIsLoading(false);
                form.resetFields();
                message.success(response.data.message);

            }
            setWbFrom('');
            setSyncingRecordId(null);
        } catch (error) {
            setIsAddActionItem(false);
            setIsActionItemSyncing(false);
            setBaseUrlOfWBforSync('');
            setLoading(false);
            setSyncingRecordId(null);
            setWbFrom('');

            form.resetFields();
            message.error(error.response.data.message);
            console.error('Error:', error);
            // Handle error (e.g., show error message)
        }
    };
    const handleUrlTypeChange = (e) => {
        const value = e.target.value;
        setWbFrom(value);

    };
    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ maxWidth: 400, margin: 'auto' }}
            initialValues={{
                actionItem: SubmitText === "Sync" ? url : '',
                wbFrom: wbFrom
            }}
        >
            {SubmitText !== "Sync" && (
                <Form.Item label="Sync your action items from app connected page to use list" name="wbFrom" style={{ margin: "2%" }}>
                    <Radio.Group
                        onChange={handleUrlTypeChange}
                        value={wbFrom}
                        disabled={SubmitText === "Sync"}
                    >
                        <Radio value="url">Add form URL</Radio>
                        <Radio value="list" >Add from the list</Radio>
                    </Radio.Group>
                </Form.Item>
            )}
            {SubmitText !== "Sync" && wbFrom === 'list' && fileNameLists.length === 0 &&(
                <Form.Item>
                <span style={{ marginTop: "20%", marginBottom: "20%", padding: 0 }}>
                    Sync your action items from the app connected{" "}
                    <a href="/profile" style={{ textDecoration: "none" }}>page</a>
                </span>
                </Form.Item>

            )}

            {wbFrom === "list" && SubmitText !== "Sync" &&
                <Form.Item
                    label="Choose an Action Item from the dropdown"
                    name="actionItem"
                    rules={
                        !url?
                            [
                                { required: true, message: 'Please enter the starting URL' },

                            ]:[]}
                >
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Choose An Action Item"
                        showSearch
                        onChange={handleFileNameChange}
                        options={fileNameLists}
                        allowClear
                        notFoundContent={loading ? "Loading..." : null}
                        className="custom-select-file"
                        placement="topLeft"
                        filterOption={(input, option) =>
                            option?.label.toLowerCase().includes(input.toLowerCase())
                        }
                        disabled={!!url}
                    />
                </Form.Item>
            }
            {SubmitText === "Sync" &&
                <Form.Item
                    label="Syncing the selected file"
                    name="actionItem"
                    rules={!url ? [
                        { required: true, message: 'Please enter the starting URL' },

                    ]:[]}
                >
                    <Select
                        style={{ width: "100%" }}
                        placeholder="Choose An Action Item"
                        showSearch
                        onChange={handleFileNameChange}
                        options={fileNameLists}
                        allowClear
                        notFoundContent={loading ? "Loading..." : null}
                        className="custom-select-file"
                        placement="topLeft"
                        filterOption={(input, option) =>
                            option?.label.toLowerCase().includes(input.toLowerCase())
                        }
                        disabled={!!url}
                    />
                </Form.Item>
            }
            {wbFrom === "url" && SubmitText !== "Sync" &&
                <Form.Item
                    label={'Add an URL'}
                    name="inputUrl"
                    rules={
                        !url?[
                            { required: true, message: 'Please enter the URL' },
                            { type: 'url', message: 'Please enter a valid URL' },
                        ]:[]
                    }
                >
                    <Input
                        placeholder={inputUrl !== '' ? inputUrl : "https://example.com"}
                    />
                </Form.Item>
            }

            <Form.Item style={{ textAlign: "right" }}>
                <Button type="primary" htmlType="submit" loading={loading}>
                    {SubmitText}
                </Button>
            </Form.Item>
        </Form>
    );
};

