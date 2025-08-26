import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { Avatar ,Button, message} from "antd";
import { botIconsMap } from "../../constants/chatPageConstants";
import { PageTitleContext } from "../../contexts/TitleContext";
import { SyncOutlined } from "@ant-design/icons";
import { axiosSecureInstance } from "../../api/axios";
import { SYNC_FILES_FROM_NAV_BAR } from "../../constants/Api_constants";

const SyncFilesFromNavBar = ({ assistantName ,assistantId}) => {
    const [isFilesSyncing,setIsFilesSyncing] = useState(false);
    useEffect(()=>{
        if(isFilesSyncing){
            getTheSyncInfo();
        }

    },[isFilesSyncing]);
    const getTheSyncInfo = async ()=>{
        const syncResponse = await axiosSecureInstance.get(SYNC_FILES_FROM_NAV_BAR(assistantId));
        if(syncResponse){
            setIsFilesSyncing(false);
            message.success(syncResponse.data.message)
        }
    }
    
    return (
        <div>
            <div
                onClick={() => {
                    setIsFilesSyncing(true);              
                  }}
                className={`thread d-flex justify-content-between align-items-center`}
            >
                &nbsp;&nbsp;&nbsp; <Button size="small" icon={isFilesSyncing? (<SyncOutlined spin />) : (<SyncOutlined />)}> Sync</Button>
            </div>

        </div>

    );
};

export default SyncFilesFromNavBar;