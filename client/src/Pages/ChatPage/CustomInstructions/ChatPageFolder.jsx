import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Button,
  Upload,
  Modal,
  message,
  Tabs,
  Form,
  Alert,
  Tooltip,
  Typography,
} from "antd";
import {
  UploadOutlined,
  CloseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "./ChatPageCustomInstructions.css";
import { axiosSecureInstance } from "../../../api/axios";
import {
  ADD_FILE_TO_PROJECTS,
  DELETE_PROJECT_FILE,
} from "../../../constants/Api_constants";
import { useParams } from "react-router-dom";
import { getUserID } from "../../../Utility/service";
import { getProjectInfo, handleFileSubmit } from "../../../api/projects";
import { IoMdArrowRoundBack } from "react-icons/io";
import { PaperClipOutlined } from "@ant-design/icons";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import {
  ASSISTANT_CODE_INTERPRETER_NOTE,
  ASSISTANT_FILE_CREATION_NOTE,
  ASSISTANT_RETRIEVAL_NOTE,
} from "../../../constants/FileLIstConstants";
import { RAGTree } from "../../../component/KnowledgeBase/RAGTree";
import useAssistantFileUpload from "../../../Hooks/useAssistantFileUpload";
import nodata from "../../../assests/images/no_data.png";
import { FcInfo } from "react-icons/fc";
import { ThemeContext } from "../../../contexts/themeConfig";

const { TabPane } = Tabs;
const userId = getUserID();

const ChatPageFolder = ({ props, states, isModalOpen, setIsModalOpen }) => {
  const [knowledgeSource, setKnowledgeSource] = useState(false);
  const [selectedFile, setSelectedFile] = useState([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [deletedSystemFileIds, setDeletedSystemFileIds] = useState([]);
  const [systemFiles, setSystemFiles] = useState([]);
  const [normalizedSystemFiles, setNormalizedSystemFiles] = useState([]);
  const [selectedFileKeys, setSelectedFileKeys] = useState([]);
  const [systemFilesNames, setSystemFilesNames] = useState([]);
  const [deletedFileList, setDeletedFileList] = useState([]);

  const { projectId } = useParams();
  const {
    setShowInstructions,
    setShowFolder,
    activeKeyOfKnowledgeBase,
    setActiveKeyOfKnowledgeBase,
    formattedRAGdData,
    formattedPublicFilesData,
    folderData,
    fetchFolderData,
    attachedFiles
  } = props;
  const { setFolderData } = states;
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (isModalOpen) {
      setShowFolder(true);
      setShowInstructions(false);
    }
  }, [isModalOpen, setShowFolder, setShowInstructions]);

  useEffect(() => {
    if (folderData) {
      let systemFileNameList = [];
      setSystemFiles([...folderData.fileInfo]);
      const normalizedFileNames = folderData.fileInfo.map((file) => {
        systemFileNameList.push(file.fileName);
        return normalizeFilename(file.fileName)
      })
      setSystemFilesNames([...systemFileNameList])
      setNormalizedSystemFiles([...normalizedFileNames]);
      if (folderData.selectedFileKeys.length > 0) {
        setSelectedFileKeys([...folderData.selectedFileKeys])
      }
    }
  }, [folderData]);

  const handleChange = (info) => {
    const fileNames = info.fileList.map((file) => file.name);
    let newFileList = info.fileList.filter((file, index, self) => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      return (
        index === self.findIndex((fileName) => fileName.name === file.name) &&
        supportedFileTypes.includes(`.${fileExtension}`) && 
        !systemFilesNames.includes(file.name)
      );
  
    });
    newFileList = newFileList.filter((file) => !systemFilesNames.includes(file.name));

    setFileList(newFileList);
  };

  const handleGoBackClick = () => {
    setIsModalOpen(false);
    setShowFolder(false);
    setShowInstructions(true);
  };

  const handleSystemFileDelete = async () => {
    const deleteResponse = await axiosSecureInstance.post(DELETE_PROJECT_FILE, {
      projectId: projectId,
      fileIdList: deletedSystemFileIds
    });
    if (deleteResponse.status === 200) {
      message.success(deleteResponse.data.message);
      const updatedFiles = systemFiles.filter(file => !deletedSystemFileIds.includes(file.fileId));
      setSystemFiles(updatedFiles);
      setFolderData(prevData => ({
        ...prevData,
        fileInfo: updatedFiles,
      }));
      setDeletedSystemFileIds([]);
      setIsUploadingFiles(false)
    }
  }

  const normalizeFilename = (filename) => {
    const baseName = filename.split('/').pop();
    const withSpaces = baseName.replace(/_/g, ' ');
    const singleSpaced = withSpaces.replace(/\s+/g, ' ');
    return singleSpaced.toLowerCase().trim();
  }

  const isFilenameTaken = (newFilename) => {
    const normalizedNew = normalizeFilename(newFilename);
    return normalizedSystemFiles.includes(normalizedNew);
  }

  const supportedFileTypes = ['.txt', '.pdf', '.json', '.docx'];

  const beforeUpload = (file) => {
    const fileNames = fileList.map((item) => item.name);

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!supportedFileTypes.includes(`.${fileExtension}`)) {
      message.error(`${file.name} is not a supported file type. Please upload files in the following formats: ${supportedFileTypes.join(', ')}`);
      return false;
    }

    if (fileNames.includes(file.name) || systemFilesNames.includes(file.name)) {
      message.error(`${file.name} is already uploaded`);
      return false;
    }
    return true;
  };

  const handleOk = async () => {
    if (deletedSystemFileIds.length > 0) {
      setIsUploadingFiles(true);
      await handleSystemFileDelete();
    }
    if (fileList.length > 0 || selectedFile.length > 0) {
      setIsUploadingFiles(true)
      const response = await handleFileSubmit(projectId, fileList, setFileList, selectedFile, setSelectedFile, fetchFolderData);
      if (response.success) {
        setIsUploadingFiles(false)
      } else {
        setIsUploadingFiles(false)
      }
    }
    const responseOfFolderInfo = await getProjectInfo(projectId);
    const responseKeys = responseOfFolderInfo?.data?.selectedFileKeys || [];

    setSelectedFileKeys([...responseKeys]);
    setActiveKeyOfKnowledgeBase("3");
    if (responseOfFolderInfo?.data?.fileInfo) {
      const fileInformation = responseOfFolderInfo?.data?.fileInfo;
      const keys = responseOfFolderInfo?.data?.selectedFileKeys
      let systemFileNameList = [];
      setSystemFiles([...fileInformation]);
      const normalizedFileNames = fileInformation.map((file) => {
        systemFileNameList.push(file.fileName);
        return normalizeFilename(file.fileName)
      })
      setSystemFilesNames([...systemFileNameList])
      setNormalizedSystemFiles([...normalizedFileNames]);
      if (keys.length > 0) {
        setSelectedFileKeys([...keys])
      }
    }
    setIsModalOpen(false);
    setShowFolder(false);
    setShowInstructions(true);
  };

  return (
    <Modal
      title="Project Files"
      open={isModalOpen}
      onCancel={handleGoBackClick}
      width={700}
      footer={[
        <Button key="back" onClick={handleGoBackClick}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isUploadingFiles}
          onClick={handleOk}
          disabled={fileList.length === 0 && selectedFile.length === 0 && deletedSystemFileIds.length === 0}
        >
          {activeKeyOfKnowledgeBase === "3" ? "Save" : "Upload"}
        </Button>,
      ]}
    >
      <div style={{ padding: "20px" }}>
        <Tabs
          activeKey={activeKeyOfKnowledgeBase}
          onChange={setActiveKeyOfKnowledgeBase}
          defaultActiveKey="1"
        >
          <TabPane
            tab="Add files from your system"
            key="1"
            disabled={knowledgeSource}
            className={knowledgeSource ? "blurred-tab" : ""}
          >
            <div className="file-content-area">
              <p className="empty-text">
                Add documents, code files, images, and more.{" "}
                <strong>User</strong> can access their contents when you chat
                inside the project.
              </p>

              <Upload.Dragger
                multiple
                onChange={handleChange}
                beforeUpload ={beforeUpload}
                fileList={fileList}
                showUploadList={false}
                className="upload-area"
              >
                <div className="upload-placeholder">
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag files to this area to upload
                  </p>
                </div>
              </Upload.Dragger>
              <div className={`supported-files-project ${theme === "dark" && "dark-mode"}`}>
                <div className="supported-files-project-info">
                  <FcInfo style={{ marginTop: "5px" }} />
                  <p>Supported Files: .txt, .pdf, .json, docx</p>
                </div>
              </div>

              {fileList.length > 0 && (
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                  <ul style={{ listStyleType: "none", padding: 0 }}>
                    {fileList.map((file) => (
                      <li
                        key={file.uid}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <PaperClipOutlined style={{ marginRight: "8px" }} />
                        <span style={{ flexGrow: 1 }}>{file.name}</span>{" "}
                        <Button
                          onClick={() => {
                            setFileList(
                              fileList.filter((f) => f.uid !== file.uid)
                            );
                          }}
                          icon={<AiOutlineDelete />}
                          size="small"
                          danger
                          style={{ marginRight: "10px", marginLeft: "5px" }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabPane>

          <TabPane
            tab="Upload From Knowledge Base"
            key="2"
            className={!knowledgeSource ? "blurred-tab" : ""}
          >
            <div>
              <p>Add files from the centralized knowledge base</p>
              <div className={`supported-files-project ${theme === "dark" && "dark-mode"}`}>
                <div className="supported-files-project-info">
                  <FcInfo style={{ marginTop: "5px" }} />
                  <p>Supported Files: .txt, .pdf, .json, docx</p>
                </div>
              </div>
              <RAGTree
                formattedRAGdData={formattedRAGdData}
                formattedPublicFilesData={formattedPublicFilesData}
                knowledgeSource={knowledgeSource}
                selectedTools={["file_search"]}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                systemFiles={systemFiles}
                selectedFileKeys={selectedFileKeys}
                setDeletedFileList={setDeletedFileList}
              />
              {selectedFile?.length > 0 && (
                <ul className="file-list">
                  <>
                    <h4 style={{ paddingTop: "14px", fontWeight: "600", fontSize: "22px" }}>Selected Files</h4>
                    <div className="file-list-container">
                      <ul>
                        {selectedFile?.map((file) => (
                          <li key={file?.key} className="file-list-item">
                            {file?.title}
                            <span className="delete-button">
                              <Button
                                danger
                                onClick={() =>
                                  setSelectedFile(
                                    selectedFile.filter(
                                      (f) => f.key !== file.key
                                    )
                                  )
                                }
                                icon={<AiOutlineDelete />}
                              />
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                  <Form.Item
                    name="fileNameList"
                    hidden
                    initialValue={JSON.stringify(selectedFile)}
                  >
                    <input type="hidden" />
                  </Form.Item>
                </ul>
              )}
            </div>
          </TabPane>
          <TabPane tab={`Attached Files (${folderData?.fileInfo?.length || 0})`} key="3">
            {folderData?.fileInfo?.length > 0 ? (
              <ul className="file-list">
                <>
                  <h4 style={{ fontWeight: "600" ,fontSize:"22px"}}>File list</h4>
                  <ul>
                    {systemFiles?.map((file) => (
                      <li key={file?.fileId} className="file-list-item">
                        <div className="file-name">{file?.fileName}</div>
                        <span className="delete-button">
                          <Button
                            danger
                            onClick={() => {
                              setSelectedFile(
                                selectedFile.filter((f) => f.key !== file.key)
                              );
                              setDeletedSystemFileIds((prev) => [...prev, file.fileId]);
                              setSystemFiles(
                                systemFiles.filter((f) => f.fileId !== file.fileId)
                              );
                            }}
                            icon={<AiOutlineDelete />}
                          />
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
                <Form.Item
                  name="fileNameList"
                  hidden
                  initialValue={JSON.stringify(selectedFile)}
                >
                  <input type="hidden" />
                </Form.Item>
              </ul>
            ) : (
              <div className="no-attached-files">
                <p style={{ color: "#999", fontSize: "14px" }}>
                  Your attached files will display here.
                </p>
                <img
                  src={nodata}
                  alt="No files"
                  style={{ width: 100, marginBottom: 12 }}
                />
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default ChatPageFolder;
