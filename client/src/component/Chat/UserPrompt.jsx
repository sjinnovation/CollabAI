import React from 'react'
import { Form, Input, Button } from 'antd';
import { AiOutlineEdit } from "react-icons/ai";
import { useState } from 'react';


const UserPrompt = ({ states }) => {
    const { chat, editProps } = states;
    const [isPromptEditMode, setIsPromptEditMode] = useState(false);
    const [promptIdToUpdate, setPromptIdToUpdate] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const defaultPrompt = chat.chatPrompt;
    const [prompt, setPrompt] = useState(defaultPrompt)

    const handleEditLastPrompt = async () => {
        const payload = {
            promptId: promptIdToUpdate,
            threadId: chat.threadId,
            userPrompt: prompt,
            tags: chat.tags,
            botProvider: chat.botProvider,
        };

        setIsUpdating(true)
        await editProps?.emitUpdateLastPrompt(payload, promptIdToUpdate, prompt);
        setIsUpdating(false)
        setIsPromptEditMode(false)

    };

    const handleCancel = () => {
        setIsPromptEditMode(false)
    };
   

    return (
        <>
            {isPromptEditMode ? (
                <Form>
                    <Form.Item name="text">
                        <Input.TextArea
                            style={{ width: "600px" }}
                            rows={3}
                            defaultValue={defaultPrompt}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button onClick={handleCancel} >
                            Cancel
                        </Button>
                        <Button type="primary" disabled={isUpdating} loading={isUpdating} style={{ marginLeft: '8px' }} onClick={handleEditLastPrompt}>
                            Update
                        </Button>
                    </Form.Item>
                </Form>
            ) : (
                <>
                    <div id="chatPrompt" className="text-wrap">
                        <pre>{chat.chatPrompt}</pre>
                    </div>
                    <div>
                        <div

                        >{editProps?.isLastItem &&
                            <Button shape="circle" onClick={() => {
                                setPromptIdToUpdate(chat?.promptId)
                                setIsPromptEditMode(true)
                            }}>
                                <AiOutlineEdit />
                            </Button>
                            }</div>
                    </div>
                </>
            )

            }
        </>
    )
}

export default UserPrompt
