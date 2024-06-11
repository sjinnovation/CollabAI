import { message } from "antd";
import { AssistantNeedToActiveFirst } from "../constants/PublicAndPrivateAssistantMessages";
import { showRemoveConfirm } from "./showModalHelper";
export const handleCheckAssistantActive = (checked, record, handlePublicAssistantAdd)=>{
    if(checked === true && record?.is_active === false){
      message.error(AssistantNeedToActiveFirst)
    }else{
      (checked === false) ? showRemoveConfirm(record.assistant_id, record.name, record?._id, localStorage.getItem("userID"), checked, record?.is_active, handlePublicAssistantAdd) : handlePublicAssistantAdd(record?._id, localStorage.getItem("userID"), checked, record?.assistant_id, record?.is_active);

    }
  };