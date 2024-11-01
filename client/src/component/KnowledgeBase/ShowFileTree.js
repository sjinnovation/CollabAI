import { FileTree } from "./FileTree";
import "./RAGTree.css";
import { Typography } from 'antd';
const { Title } = Typography;

export const ShowFileTree = ({ dataProps }) => {
    const { selectedMyFiles, folderStructure, setFolderStructure, selectedFolder, setSelectedFolder, selectedFile, setSelectedFile, isAdmin, allUsersFileTreeStructure, setAllUsersFileTreeStructure, allPublicData, publicFilesStructure, setPublicFilesStructure } = dataProps;

    return (
        <div className="flex-container">
            <div className="file-tree-wrapper">
                {(isAdmin) ? (
                    <>
                        {folderStructure.length > 0 ? <Title level={3} className="treeName">Organizational Files</Title> : ''}
                        <FileTree
                            dataProps={{ folderStructure: publicFilesStructure, setFolderStructure: setPublicFilesStructure, selectedFolder: null, setSelectedFolder: null, selectedFile, setSelectedFile, isAdmin }}
                        />

                        {selectedMyFiles ? (
                            <>
                                <Title level={3} className="treeName">My Files</Title>
                                <FileTree
                                    dataProps={{ folderStructure, setFolderStructure, selectedFolder, setSelectedFolder, selectedFile, setSelectedFile, isAdmin }}
                                />
                            </>
                        ) : (
                            <>
                                <Title level={2} className="treeName">All Users Files</Title>
                                <FileTree
                                    dataProps={{ folderStructure: allUsersFileTreeStructure, setFolderStructure: setAllUsersFileTreeStructure, selectedFolder: null, setSelectedFolder: null, selectedFile, setSelectedFile, isAdmin }}
                                />
                            </>
                        )}
                    </>
                ) : (
                    <>
                        {folderStructure && <Title level={3} className="treeName">Organizational Files</Title>}
                        <FileTree
                            dataProps={{ folderStructure: publicFilesStructure, setFolderStructure: setPublicFilesStructure, selectedFolder: null, setSelectedFolder: null, selectedFile, setSelectedFile, isAdmin }}
                        />
                        <Title level={3} className="treeName">My Files</Title>
                        <FileTree
                            dataProps={{ folderStructure, setFolderStructure, selectedFolder, setSelectedFolder, selectedFile, setSelectedFile }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
