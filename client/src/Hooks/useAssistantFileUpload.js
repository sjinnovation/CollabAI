import { useEffect, useState } from "react";
import { message } from "antd";
import { createAssistantWithFiles, updateAssistantWithDetailsAndFiles } from "../api/assistant";
import {
  retrievalFileTypes,
  codeInterpreterFileTypes,
} from "../constants/FileLIstConstants";

const useAssistantFileUpload = (onDeleteFile, selectedTools, getInitialFiles) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const initialFiles = getInitialFiles();
    const fileListFormatted = initialFiles.map((file, index) => ({
      uid: `existing-${index}`,
      name: file,
      status: "done",
    }));
    setFileList(fileListFormatted);
  }, [getInitialFiles]);
    
  const handleCreateOrUpdateAssistantWithFiles = async (
    formData,
    editMode,
    assistantId
  ) => {
    try {
      setUploading(true);

      const response = editMode
        ? await updateAssistantWithDetailsAndFiles(assistantId, formData)
        : await createAssistantWithFiles(formData);

      if (response.data) {
        message.success(
          response.message
        );
        return true;
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (file) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid);
    setFileList(newFileList);

    if (file.uid.startsWith("existing")) {
      const index = parseInt(file.uid.split("-")[1], 10);
      onDeleteFile(index);
    }
  };
  const handleAddFile = (file) => {
    const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`; 
    let allowedFileTypes = [];

    const flatSelectedTools = Array.isArray(selectedTools)
      ? selectedTools.flat()
      : selectedTools;

    if (flatSelectedTools.includes("code_interpreter")) {
      allowedFileTypes = [...allowedFileTypes, ...codeInterpreterFileTypes];
    }
    if (flatSelectedTools.includes("retrieval")) {
      allowedFileTypes = [...allowedFileTypes, ...retrievalFileTypes];
    }

    const uniqueAllowedFileTypes = [
      ...new Set(allowedFileTypes.map((type) => type.toLowerCase())),
    ];

    const isFileAllowed = uniqueAllowedFileTypes.includes(fileExtension);

    if (!isFileAllowed) {
      message.error(`Unsupported file type: ${file.name} select the files that are supported for your tools enabled.`);
      return false;
    }

    setFileList((prevList) => [...prevList, file]);
    return false;
  };

  const isUploading = () => uploading;

  return {
    handleCreateOrUpdateAssistantWithFiles,
    handleRemoveFile,
    handleAddFile,
    fileList,
    setFileList,
    isUploading,
  };
};

export default useAssistantFileUpload;
