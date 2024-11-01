import { useEffect, useState } from "react";
import { message,Upload } from "antd";
import { createAssistantWithFiles, updateAssistantWithDetailsAndFiles } from "../api/assistant";
import {
  retrievalFileTypes,
  codeInterpreterFileTypes,
} from "../constants/FileLIstConstants";

import { FileContext } from "../contexts/FileContext";
import { useContext } from "react";
const useAssistantFileUpload = (onDeleteFile, selectedTools, getInitialFiles) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [countTotalFile, setCountTotalFile] = useState(0)
  const [totalFileList,setTotalFileList] = useState([]);
  const {  deletedFileList,setDeletedFileList} = useContext(FileContext);
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
      setDeletedFileList([])
      setUploading(false);
    }
  };

  const handleRemoveFile = (file) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid);
    const newTotalFileList = totalFileList.filter((f) => f.uid !== file.uid);

    setFileList(newFileList);
    setTotalFileList(newTotalFileList);
    setDeletedFileList((prev)=>[...prev,file.uid]);

    if (file.uid.startsWith("existing")) {
      const index = parseInt(file.uid.split("-")[1], 10);
      onDeleteFile(index);
    }
  };
  const handleAddFile = (file, fileList) => {
    if (countTotalFile > 20) {
      return false;

    }
    const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`;
    let allowedFileTypes = [];

    const flatSelectedTools = Array.isArray(selectedTools)
      ? selectedTools.flat()
      : selectedTools;

    if (flatSelectedTools.includes("code_interpreter")) {
      allowedFileTypes = [...allowedFileTypes, ...codeInterpreterFileTypes];
    }
    if (flatSelectedTools.includes("file_search")) {
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
    const existingFilenames = totalFileList.map(f => f.name);
    if (existingFilenames.includes(file.name)) {
      message.error(`The file "${file.name}" already exists. Please upload a file with a unique name.`);
      return Upload.LIST_IGNORE;
    }
    else{
      setFileList((prevList) => [...prevList, file]);
      setTotalFileList((prevList) => [...prevList, file]);

    }

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
    setCountTotalFile,
    countTotalFile,
    totalFileList,
    setTotalFileList
  };
};

export default useAssistantFileUpload;
