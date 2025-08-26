import { useEffect, useState } from "react";
import { message, Upload } from "antd";
import {
  createAssistantWithFiles,
  updateAssistantWithDetailsAndFiles,
} from "../api/assistant";
import {
  retrievalFileTypes,
  codeInterpreterFileTypes,
} from "../constants/FileLIstConstants";

import { FileContext } from "../contexts/FileContext";
import { useContext } from "react";

const useAssistantFileUpload = (
  onDeleteFile,
  selectedTools,
  getInitialFiles
) => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [countTotalFile, setCountTotalFile] = useState(0);
  const [totalFileList, setTotalFileList] = useState([]);
  const {
    deletedFileList,
    setDeletedFileList,
    deleteFileIds,
    setDeleteFileIds,
  } = useContext(FileContext);

  useEffect(() => {
    const initialFiles = getInitialFiles();
    const fileListFormatted = initialFiles
      ?.map((file, index) => ({
        uid: `existing-${index}`,
        name: file,
        status: "done",
      }))
      .filter((file) => !deleteFileIds.includes(file.uid));
    setFileList(fileListFormatted);
  }, [getInitialFiles, deleteFileIds]);

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
        message.success(response.message);
        return true;
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message);
      return false;
    } finally {
      setDeletedFileList([]);
      setUploading(false);
    }
  };

  const handleRemoveFile = (file) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid);
    const newTotalFileList = totalFileList.filter((f) => f.uid !== file.uid);

    setFileList(newFileList);
    setTotalFileList(newTotalFileList);
    setCountTotalFile(newFileList.length);
    setDeleteFileIds((prev) => [...prev, file.uid]);

    if (file.uid.startsWith("existing")) {
      const index = parseInt(file.uid.split("-")[1], 10);
      onDeleteFile(index);
    }
  };

  const handleAddFile = (file, fileListParam) => {
    if (countTotalFile >= 20) {
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
      message.error(
        `Unsupported file type: ${file.name}. Please select files that are supported for your enabled tools.`
      );
      return false;
    }

    const isDuplicate = fileList.some(
      (existingFile) => existingFile?.name === file?.name
    );
    if (isDuplicate) {
      message.warning(
        `File '${file.name}' already exists. Please upload a unique file.`
      );
      return Upload.LIST_IGNORE;
    }

    setFileList((prevList) => [...prevList, file]);
    setTotalFileList((prevList) => [...prevList, file]);
    setCountTotalFile((prev) => prev + 1);

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
    setTotalFileList,
  };
};

export default useAssistantFileUpload;
