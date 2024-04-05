import { axiosOpen } from "../../../../api/axios";


export const updateFunctionCallingAssistant= async(assistantFunctionCallData)=>{
  try{
    const response = await axiosOpen.patch(
      `api/assistants/updateFunctionCallingAssistantdata/${assistantFunctionCallData.assistant_id}`,
      assistantFunctionCallData
    );
    return response;
  }catch(err){
    return err;
  }
  
}

export const createAssistantWithFunctionCalling= async(assistantFunctionCallData)=>{
  try{
    const response = await axiosOpen.post(
      "api/assistants/createassistantFunctionCalling",
      assistantFunctionCallData
    );
    return response;
  }catch(err){
    return err;
  }
 
 
}

