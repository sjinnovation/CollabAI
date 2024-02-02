import { useState } from "react";
import { message } from "antd";
import Assistant from "../api/assistant";
import {
  retrievalFileTypes,
  codeInterpreterFileTypes,
} from "../constants/FileLIstConstants";

const { createAssistantWithFiles, updateAssistantWithFiles } = Assistant();

const useAssistantFileUpload = (onDeleteFile, selectedTools) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleCreateOrUpdateAssistantWithFiles = async (
    formData,
    editMode,
    assistantId
  ) => {
    try {
      setUploading(true);

      const response = editMode
        ? await updateAssistantWithFiles(formData, assistantId)
        : await createAssistantWithFiles(formData);

      console.log(response, "response");
      if (response.data) {
        message.success(
          response?.data?.message || "Assistant Created successfully"
        );
        return true;
      }
      message.error(response?.error?.message);
      return false;
    } catch (error) {
      message.error("Something went wrong");
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
      console.log("Including retrieval file types");
      allowedFileTypes = [...allowedFileTypes, ...retrievalFileTypes];
    }

    const uniqueAllowedFileTypes = [
      ...new Set(allowedFileTypes.map((type) => type.toLowerCase())),
    ];

    const isFileAllowed = uniqueAllowedFileTypes.includes(fileExtension);

    if (!isFileAllowed) {
      message.error(`Unsupported file type: ${file.name} select the appropriate tools`);
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
