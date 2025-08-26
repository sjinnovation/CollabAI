import React, { useContext, useEffect } from 'react'
import { Form, Input, Button, Card, Row, Col } from 'antd';
import { AiOutlineEdit } from "react-icons/ai";
import { useState } from 'react';
import { FileContext } from '../../contexts/FileContext';
import { getQuestionAndImageUrl } from '../../api/fluxImageGenerator';
import doc from "../../assests/images/file-icons/doc.png"
import pdf from "../../assests/images/file-icons/pdf.png"
import ppt from "../../assests/images/file-icons/ppt.png"
import txt from "../../assests/images/file-icons/txt.png"
import xls from "../../assests/images/file-icons/xls.png"
import cvs from "../../assests/images/file-icons/csv-file.png"
import json from "../../assests/images/file-icons/json.png"
import ai from "../../assests/images/file-icons/ai.png"
import img from "../../assests/images/file-icons/image.png"
import "./Chat.css";

import workBoardIcon from "../../assests/images/knowledge-base-menu/workboard_icon.svg"
import { ThemeContext } from '../../contexts/themeConfig';
import { LuFileText } from "react-icons/lu";

const UserPrompt = ({ states, isEditableModel}) => {
    const { chat, editProps ,folderId=null} = states;
    const [isPromptEditMode, setIsPromptEditMode] = useState(false);
    const [promptIdToUpdate, setPromptIdToUpdate] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const defaultPrompt = chat.chatPrompt;
    const [prompt, setPrompt] = useState(defaultPrompt)
    const {selectedFileAppWithFileId,setSelectedFileAppWithFileId}= useContext(FileContext);
    const { theme } = useContext(ThemeContext);
    const {query,imageUrl} = getQuestionAndImageUrl(chat.chatPrompt);
    const iconFile =  {
        txt: txt,
        pptx: ppt,
        pdf: pdf,
        xlsx: xls,
        docx: doc,
        csv: cvs,
        ai:ai,
        json:json,
        jpg : img,
        jpeg : img,
        png : img,
        gif : img,
        webp : img,
    
      }
    
      const getFileIcon = (fileName) => {
        const ext =  fileName.split(".")[1];
        if(iconFile.hasOwnProperty(ext)) {
          return iconFile[ext];
        }
      }

       // Check if the response is a Base64 image string
  const isBase64Image = (str) => {
    return /^data:image\/[a-zA-Z]+;base64,/.test(str);
  };

  // Check if the response is an image URL
  const isImageUrl = (str) => {
    return /^http/.test(str);
  };

    const handleEditLastPrompt = async () => {
        const payload = {
            promptId: promptIdToUpdate,
            threadId: chat.threadId,
            userPrompt: prompt,
            tags: chat.tags,
            botProvider: chat.botProvider,
            folderId : folderId
        };

        setIsUpdating(true)
        await editProps?.emitUpdateLastPrompt(payload, promptIdToUpdate, prompt);
        setIsUpdating(false)
        setIsPromptEditMode(false)

    };

    const handleCancel = () => {
        setIsPromptEditMode(false)
    };
   
      const truncateFileName = (name, max = 32) => {
    if (name.length <= max) return name;
    const ext = name.split(".").pop();
    const base = name.slice(0, max - ext.length - 5);
    return `${base}...${ext}`;
  };

  const getColoredText = (text) => {
    const [leftPart, rightPart] = text.split(":");
      
        return (
          <>
            <span style={{ color: 'blue' }}>{leftPart+' '}</span> {rightPart}
          </>
        );
      };
    return (
        <>
        {isPromptEditMode ? (
          <Form>
            <Form.Item name="text">
              <Input.TextArea
              className='PromptInputText'
                rows={3}
                defaultValue={defaultPrompt}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </Form.Item>
  
            <Form.Item>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button
                type="primary"
                disabled={isUpdating}
                loading={isUpdating}
                className='ButtonUpdate'
                onClick={handleEditLastPrompt}
              >
                Update
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <>
            {typeof chat.chatPrompt === "string" &&
            (isBase64Image(chat.chatPrompt) || isImageUrl(chat.chatPrompt)) ? (
              <div className="bot-image-response">
                <img
                  src={chat.chatPrompt}
                  alt="Bot Response"
                  className="image-preview"
                />
              </div>
            ) : (
              <div id="chatPrompt" className="text-wrap">
                <pre>{query ? query : chat.chatPrompt}</pre>
  
                {/* Files Rendering */}
                <div className="file-list-wrapper">
                  {chat?.files &&
                    chat?.files.map((file, index) => {
                      const ext = file.fileName.split(".").pop().toLowerCase();
                      const isImageFile = [
                        "jpg",
                        "jpeg",
                        "png",
                        "gif",
                        "webp",
                      ].includes(ext);
  
                      return (
                        <div key={index}>
                          {isImageFile && chat?.base64Url ? (
                            <div className="image-container">
                              <img
                                src={chat?.base64Url}
                                alt={file.fileName}
                                className="image-preview"
                              />
                            </div>
                          ) : (
                            <div className="file-card">
                              <div className="file-icon">
                                <LuFileText className="icon" />
                              </div>
                              <div className="file-info">
                                <div className="file-name">
                                  {truncateFileName(file.fileName)}
                                </div>
                                <div className="file-type">
                                  {file.fileName.split(".").pop().toUpperCase()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
  
            {/* Edit Button */}
            <div>
              {editProps?.isLastItem && (
                <Button
                  shape="circle"
                  disabled={!isEditableModel}
                  onClick={() => {
                    setPromptIdToUpdate(chat?.promptId);
                    setIsPromptEditMode(true);
                  }}
                >
                  <AiOutlineEdit />
                </Button>
              )}
            </div>
          </>
        )}
      </>
    )
}

export default UserPrompt
