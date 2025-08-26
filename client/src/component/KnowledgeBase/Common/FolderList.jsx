import React from 'react'
import folder from "../../../assests/images/file-icons/folder.png"
import sharedFolder from "../../../assests/images/file-icons/share-folder.png"
import { Tooltip } from 'antd'
import { FaCheckCircle } from 'react-icons/fa'

const FolderList = ({ dataSource, setSelectedFolder, selectedFolder, setSelectedFolderData, isFileUploadChecked = false, setIsFileUploadChecked = () => {}, setIsButtonDisabled }) => {
  return (
    <div className="folder-list-modal" >
    {dataSource?.map((folderData) => {
        if(folderData.type === "folder") {
              return (
                <div key={folderData._id} className={`single-folder ${selectedFolder === folderData?._id ? 'selected' : ''}`} onClick={() => {
                  setSelectedFolder(folderData?._id);
                  setSelectedFolderData(folderData);
                  setIsFileUploadChecked((prevState) => {
                    if(prevState) {
                        return false;
                    }
                  });
                  setIsButtonDisabled(false);
                }}>
                    <div className="icon">
                        <img src={folderData?.isKnowledgeBaseShareable ? sharedFolder : folder} alt=""/>
                    </div>
                    <div className="info">
                    <Tooltip title={folderData.name}>
                    <p className="name">{folderData.name?.length > 15 ?  folderData.name?.slice(0, 15) + "...":  folderData.name}</p>
                    </Tooltip>
                      <span className="created-by">Created by {folderData?.owner}</span>
                    </div>
                    {selectedFolder === folderData._id && <FaCheckCircle className="select-icon"/>}
                </div>
              )
            }      
            return <></>   
      })}
  </div>
  )
}

export default FolderList