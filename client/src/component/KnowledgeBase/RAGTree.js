import { Layout, Tree, Modal, message } from 'antd';
import { FolderOpenOutlined, FileOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getAllKnowledgeBase } from '../../api/knowledgeBase';
import './RAGTree.css';
import { useContext } from 'react';
import { FileContext } from '../../contexts/FileContext';
import { Typography } from 'antd';
import { codeInterpreterFileTypes, retrievalFileTypes } from '../../constants/FileLIstConstants';

const { Title } = Typography;
const { TreeNode } = Tree;

const allowedFileTypesCheck = (selectedTools, fileName) => {
    const fileExtension = `.${fileName.split(".").pop().toLowerCase()}`;
    let allowedFileTypes = [];

    const flatSelectedTools = selectedTools?(Array.isArray(selectedTools)
        ? selectedTools.flat()
        : selectedTools):[];

    if (flatSelectedTools?.includes("code_interpreter")) {
        allowedFileTypes = [...allowedFileTypes, ...codeInterpreterFileTypes];
    }
    if (flatSelectedTools?.includes("file_search")) {
        allowedFileTypes = [...allowedFileTypes, ...retrievalFileTypes];
    }

    const uniqueAllowedFileTypes = [
        ...new Set(allowedFileTypes.map((type) => type?.toLowerCase())),
    ];
    const isFileAllowed = uniqueAllowedFileTypes?.includes(fileExtension);

    if (!isFileAllowed) {
        return false;
    }
    return true;
}

export const RAGTree = ({ formattedRAGdData, formattedPublicFilesData , selectedTools, knowledgeSource, selectedFile, setSelectedFile, selectedFileKeys =[], setDeletedFileList, setDeleteFileIds, assistantData, editMode }) => {
    const { folderStructure, setFolderStructure, selectedFolders, setSelectedFolders } = useContext(FileContext);
    const [publicFilesStructure, setPublicFilesStructure] = useState([]);

    const handleFileSelectionUpdate = (key, title) => {
        // Remove from deletedFileList and deleteFileIds when file is selected
        if (!selectedFile?.some(file => file.key === key)) {
            setDeletedFileList(prev => prev.filter(deletedKey => deletedKey !== key));
            // If in edit mode, also update deleteFileIds
            if (editMode) {
                const fileIds = assistantData?.fileIdsWithKeysOfKnowledgeBase?.filter((f) => f.key === key);
                if (fileIds?.[0]?.file_id) {
                    setDeleteFileIds(prev => prev.filter(id => id !== fileIds[0].file_id));
                }
            }
        }

        setSelectedFile((prevSelectedFiles = []) => {
            if (prevSelectedFiles?.some(file => file.key === key)) {
                // When deselecting, add to deletedFileList and deleteFileIds if in edit mode
                if (editMode) {
                    setDeletedFileList(prev => [...prev, key]);
                    const fileIds = assistantData?.fileIdsWithKeysOfKnowledgeBase?.filter((f) => f.key === key);
                    if (fileIds?.[0]?.file_id) {
                        setDeleteFileIds(prev => [...prev, fileIds[0].file_id]);
                    }
                }
                return prevSelectedFiles?.filter(file => file.key !== key);
            } else {
                return [...prevSelectedFiles, { key, title }];
            }
        });
    };

    const handleRightClick = ({ node }) => {
        const { key, title } = node;
        setSelectedFolders(prevSelectedFolders => {
            if (prevSelectedFolders.includes(key)) {
                return prevSelectedFolders.filter(folderKey => folderKey !== key);
            } else {
                return [...prevSelectedFolders, key];
            }
        });

        setSelectedFile(prevSelectedFiles => {
            if (prevSelectedFiles?.some(file => file.key === key)) {
                return prevSelectedFiles?.filter(file => file.key !== key);
            } else {
                return [...prevSelectedFiles, { key, title }];
            }
        });

    };

    const handleFolderSelect = (selectedKeys, info) => {
        const { selected, node } = info;
        const { key, title } = node;
        if (!title.includes(".")) {
            if (selected) {
                selectAllFilesInFolder(node);

            } else {
                deselectAllFilesInFolder(node);
            }
        } else {
            toggleFileSelection(node);
        }

    };

    const selectAllFilesInFolder = (node) => {
        const { key, children } = node;
        const fileKeys = getAllFileKeys(node);

        setSelectedFolders((prevSelectedFolders = []) => {
            if (!prevSelectedFolders.includes(key)) {
                return [...prevSelectedFolders, key];
            }
            return prevSelectedFolders;
        })

        setSelectedFile((prevSelectedFiles = []) => {
            const newFiles = [...prevSelectedFiles];
            fileKeys.forEach(fileKey => {
                const existingFile = newFiles.find(file => file.key === fileKey);
                if(selectedFileKeys.includes(fileKey)){
                    return message.error(`${getTitleByKey(fileKey)} is already uploaded in Attached Files`);
                }
                if (!existingFile) {
                    const fileTitle = getTitleByKey(fileKey);
                    if(knowledgeSource || allowedFileTypesCheck(selectedTools, fileTitle)) {
                        // Remove from deletedFileList and deleteFileIds when file is selected
                        setDeletedFileList(prev => prev.filter(deletedKey => deletedKey !== fileKey));
                        if (editMode) {
                            const fileIds = assistantData?.fileIdsWithKeysOfKnowledgeBase?.filter((f) => f.key === fileKey);
                            if (fileIds?.[0]?.file_id) {
                                setDeleteFileIds(prev => prev.filter(id => id !== fileIds[0].file_id));
                            }
                        }
                        newFiles.push({ key: fileKey, title: fileTitle })
                    }
                }
            });
            return newFiles;
        })
    };


    const deselectAllFilesInFolder = (node) => {
        const { key } = node;
        const fileKeys = getAllFileKeys(node);

        setSelectedFolders(prevSelectedFolders => {
            return prevSelectedFolders.filter(folderKey => folderKey !== key);
        });

        // When deselecting files, add them to deletedFileList and deleteFileIds if in edit mode
        if (editMode) {
            fileKeys.forEach(fileKey => {
                setDeletedFileList(prev => [...prev, fileKey]);
                const fileIds = assistantData?.fileIdsWithKeysOfKnowledgeBase?.filter((f) => f.key === fileKey);
                if (fileIds?.[0]?.file_id) {
                    setDeleteFileIds(prev => [...prev, fileIds[0].file_id]);
                }
            });
        }

        setSelectedFile(prevSelectedFiles => {
            return prevSelectedFiles?.filter(file => !fileKeys.includes(file.key));
        });
    };

    const getAllFileKeys = (node) => {
        const keys = [];

        const traverse = (node) => {
            if (node.title.includes(".")) {
                keys.push(node.key);
            } else if (node.children) {
                node.children.forEach(child => traverse(child));

            }

        };

        traverse(node);
        return keys;
    };

    const getTitleByKey = (key) => {
        const getNodeTitle = (nodes) => {
            for (let node of nodes) {

                if (node._id === key) {
                    return node.name;
                } else if (node.children) {
                    const title = getNodeTitle(node.children);
                    if (title) {
                        return title;
                    }
                }
            }
            return null;
        };

        return getNodeTitle(formattedRAGdData) || getNodeTitle(formattedPublicFilesData);
    };

    const toggleFileSelection = (node) => {
        const { key, title } = node;
        if (knowledgeSource) {
            handleFileSelectionUpdate(key, title);
        } else {
            if (selectedFileKeys.includes(key)) {
                return message.error(`${title} is already uploaded in Attached Files`);
            }
            if (allowedFileTypesCheck(selectedTools, title)) {
                handleFileSelectionUpdate(key, title);
            } else {
                return message.error(`Unsupported file type: ${title} select the files that are supported for your tools enabled.`);
            }
        }
    };

    const renderTreeNodes = (data) => {
        const nodes = Array.isArray(data) ? data : [];
        return nodes
            .filter(item => item?.type !== 'folder' || (item?.children && item?.children?.length > 0)) // Filter out empty folders
            .map(item => (
                <TreeNode
                    title={item?.type === 'folder' ? item?.name : item?.name.split('/').pop()}
                    key={item?._id}
                    icon={item?.type === 'folder' ? <FolderOpenOutlined /> : <FileOutlined />}
                    className={selectedFolders.includes(item?._id) ? 'selected-node' : ''}
                >
                    {item?.children && item?.children?.length > 0 ? renderTreeNodes(item?.children) : null}
                </TreeNode>
            ));
    };


    useEffect(() => {
        getAllFiles();
    }, []);

    useEffect(() => {
        if (selectedFile?.length === 0) {
            setSelectedFolders([]);
            setSelectedFile([]);

        }

    }, [selectedFile]);

    const getAllFiles = async () => {
        setFolderStructure(formattedRAGdData);
        setPublicFilesStructure(formattedPublicFilesData);
    };

    return (
        <div>
            {formattedPublicFilesData && formattedPublicFilesData?.length > 0 ? <Title style={{fontWeight:"600", fontSize:"22px"}} className="treeName" >Organizational files</Title> : ''}


            <Tree
                defaultExpandAll={false}
                onSelect={handleFolderSelect}
                onRightClick={handleRightClick}
                selectedKeys={selectedFolders}
                multiple
                showIcon
            >
                {renderTreeNodes(formattedPublicFilesData)}

            </Tree>
            {formattedRAGdData && formattedRAGdData?.length > 0 ? <Title level={2} className="treeName">My Files</Title> : ''}
            <Tree
                defaultExpandAll={false}
                onSelect={handleFolderSelect}
                onRightClick={handleRightClick}
                selectedKeys={selectedFolders}
                multiple
                showIcon
            >

                {renderTreeNodes(formattedRAGdData)}
            </Tree>
        </div>
    );


};

export const getFilesFromFolder = (structure, folderKey) => {
    if (!Array.isArray(structure)) return []
    for (const folder of structure) {
        if (folder.key === folderKey) {
            return folder?.children || [];
        } else if (folder?.children && folder.children?.length > 0) {
            const result = getFilesFromFolder(folder.children, folderKey);
            if (result?.length > 0) return result;
        }
    }
    return [];
};

export const formatToTreeData = (data) => {
    const tree = [];

    data.forEach(file => {
        const pathParts = file.name.split('/');
        const fileName = pathParts.pop();
        let currentLevel = tree;
        pathParts.forEach((part, index) => {
            let existingPath = currentLevel.find(child => child.title === part);
            if (!existingPath) {
                existingPath = { title: part, key: `${part}-${index}`, type: 'folder', children: [] };
                currentLevel.push(existingPath);
            }
            if (!existingPath.children) {
                existingPath.children = [];
            }
            currentLevel = existingPath.children;
        });

        if (fileName) {
            const isFile = fileName.includes(".");
            currentLevel.push({
                title: fileName,
                key: file._id,
                type: isFile ? 'file' : 'folder',
                ...file,
            });
        }
    });

    return tree;
};

