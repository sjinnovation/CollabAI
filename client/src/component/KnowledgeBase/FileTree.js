import { Layout, Tree,  Modal } from 'antd';
import { FolderOpenOutlined, FileOutlined } from '@ant-design/icons';
import { useState,useEffect } from 'react';
import { getAllKnowledgeBase } from '../../api/knowledgeBase';
const { TreeNode } = Tree;

export const FileTree = ({ dataProps }) => {

    const {folderStructure,setFolderStructure, selectedFolder, setSelectedFolder,selectedFile,setSelectedFile,isAdmin} = dataProps;
    const [files, setFiles] = useState([]);
    const handleFolderSelect = (selectedKeys, info) => {
      if(selectedFolder !==null){
        if(!info?.node?.title?.includes(".")){
          setSelectedFolder(selectedKeys[0]);
          setSelectedFile(info.node);
          const selectedFolderFiles = getFilesFromFolder(folderStructure, selectedKeys[0]);
        }
      }


      
  };


  const renderTreeNodes = (data) => {
    const nodes = Array.isArray(data) ? data : [];
    return nodes.map(item => (
      <TreeNode
        title={item.type === 'folder' ? item.title : item.name.split('/').pop()}
        key={item.key}
        icon={item.type === 'folder' ? <FolderOpenOutlined size={"large"}/> : <FileOutlined size={"large"}/>}
      >
        {item.children && item.children.length > 0 ? renderTreeNodes(item.children) : null}
      </TreeNode>
    ));
  };
    
    
    return (
        <Tree
            defaultExpandAll={false}
            onSelect={handleFolderSelect}
            selectedKeys={[selectedFolder]}
            showIcon
        >
            {renderTreeNodes(folderStructure)}
        </Tree>
    );

};


export const getFilesFromFolder = (structure, folderKey) => {
  if (!Array.isArray(structure)) return []
    for (const folder of structure) {
      if (folder.key === folderKey) {
        return folder.children || [];
      } else if (folder.children && folder.children.length > 0) {
        const result = getFilesFromFolder(folder.children, folderKey);
        if (result.length > 0) return result;
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
        currentLevel = existingPath.children ;
      });

      if(fileName){
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
