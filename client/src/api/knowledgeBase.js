import { axiosSecureInstance } from "./axios";
import { message } from "antd";
import { GET_ALL_OR_CREATE_KNOWLEDGE_BASE,GET_SINGLE_OR_UPDATE_OR_DELETE_KNOWLEDGE_BASE,GET_ALL_KNOWLEDGE_BASE_PAGINATED,CREATE_VECTORS_FROM_FILE ,DELETE_ALL_KNOWLEDGE_BASE_OF_A_USER,GET_SINGLE_USERS_ALL_KNOWLEDGE_BASE_OR_UPDATE_PUBLIC_STATE,DELETE_MULTIPLE_KNOWLEDGE_BASE, GET_SINGLE_USERS_ALL_KNOWLEDGE_BASE, UPDATE_KNOWLEDGE_BASE_FOLDER_NAME, MOVE_KNOWLEDGE_BASE_FILE, GET_USERS_FOR_GRANT_ACCESS, GRANT_ACCESS_TO_USERS, GET_EXISTING_USERS_FOR_FOLDER_ACCESS, REMOVE_ACCESS_TO_USERS} from "../constants/Api_constants";
import { getUserID, getUserRole } from "../Utility/service";
import KnowledgeBase from "../Pages/KnowledgeBase";



const role = getUserRole();
const userId = getUserID();
export const getAllKnowledgeBase = async (page = 1,pageSize = 10 ,searchQuery='',selectedTree=0) => {
    try {

        const response = await axiosSecureInstance.post(GET_SINGLE_USERS_ALL_KNOWLEDGE_BASE(page,pageSize ,searchQuery,selectedTree,getUserID()),{role : role});
        if (response.status === 200) {
            const data=response?.data?.data;
            const allUserData=response?.data?.allUserData;
            const allPublicKnowledgeBase=response?.data?.allPublicKnowledgeBase;
            const treeData = response?.data?.treeData;
            const publicTreeData = response?.data?.publicTreeData;



            let files=[]
            for (const d in data){
                files.push(data[d].name);
            }
            return { success: true, data: response.data.data,allUserData : allUserData,allPublicKnowledgeBase : allPublicKnowledgeBase ,treeData,publicTreeData, message: response?.data?.message };
        }

    } catch (error) {
        return { success: false,  message: error?.response?.data?.message };

    }

};

export const getKnowledgeBases = async (currentPage, limit) => {
  try {
    const response = await axiosSecureInstance.get(GET_ALL_KNOWLEDGE_BASE_PAGINATED(currentPage, limit));
    const knowledgeBaseFiles = response?.data?.name || [];
    const count = response?.data?.pages || 1;
    return { success: true, data: knowledgeBaseFiles, pageCount: count };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const createKnowledgeBase = async (KnowledgeBase) => {
    try {
    const response = await axiosSecureInstance.post(GET_ALL_OR_CREATE_KNOWLEDGE_BASE(), KnowledgeBase);
    return { success: true, data: response?.data?.data?.name, message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const createVectorOfKnowledgeBase = async (KnowledgeBase) => {
  try {
  const response = await axiosSecureInstance.post(CREATE_VECTORS_FROM_FILE(), KnowledgeBase);
  return { success: true, message: response?.data?.message };
} catch (error) {
  return { success: false, message: error?.response?.data?.message };
}
};
export const deleteKnowledgeBase = async (KnowledgeBaseIdToDelete,userId) => {
  try {
    let isAdmin= false;
    if(role === "superadmin" ||"admin"){
      isAdmin = true;
    }
    const response = await axiosSecureInstance.delete(GET_SINGLE_OR_UPDATE_OR_DELETE_KNOWLEDGE_BASE(KnowledgeBaseIdToDelete,userId,isAdmin));
    return { success: true, message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const deleteMultipleKnowledgeBase = async (userId,selectedRowKeys) => {
  try {
    let isAdmin= false;
    if(role === "superadmin" ||"admin"){
      isAdmin = true;
    }
    const requestBody={
      userId : userId,
      KnowledgeBaseIds : selectedRowKeys,
      isAdmin :isAdmin,
    }
    const response = await axiosSecureInstance.delete(DELETE_MULTIPLE_KNOWLEDGE_BASE(),{data:requestBody});
    return { success: true, message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};
export const deleteSingleUsersAllKnowledgeBase=async (userId)=>{
  try {
    const response = await axiosSecureInstance.delete(DELETE_ALL_KNOWLEDGE_BASE_OF_A_USER(userId));
    return { success: true, message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
}

export const getKnowledgeBaseById = async (id) => {
  try {
    const userId = getUserID();
    const response = await axiosSecureInstance.get(GET_SINGLE_OR_UPDATE_OR_DELETE_KNOWLEDGE_BASE(id,userId));
    return { success: true, data: response?.data?.data?.name, message: response?.data?.message};
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const updateKnowledgeBase = async (KnowledgeBaseIdToEdit, requestBody) => {
  try {
    
    const response = await axiosSecureInstance.patch(GET_SINGLE_USERS_ALL_KNOWLEDGE_BASE_OR_UPDATE_PUBLIC_STATE(KnowledgeBaseIdToEdit), requestBody);
    return { success: true,  message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const updateKnowledgeBaseFolderName = async (id, requestBody) => {
  try {
    
    const response = await axiosSecureInstance.patch(UPDATE_KNOWLEDGE_BASE_FOLDER_NAME(id), requestBody);
    return { success: true,  message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const moveKnowledgeBaseFile = async (id, requestBody) => {
  try {
    const response = await axiosSecureInstance.patch(MOVE_KNOWLEDGE_BASE_FILE(id), requestBody);
    return { success: true,  message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const getUsersForGrantAccess = async (knowledgeBaseId, page, count, searchTerm) => {
  try {
    const response = await axiosSecureInstance.get(GET_USERS_FOR_GRANT_ACCESS(knowledgeBaseId, page, count, searchTerm));
    return { success: true,  message: response?.data?.message, response: response };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
}

export const getExistingUsersForGrantAccess = async (knowledgeBaseId, page, count) => {
  try {
    const response = await axiosSecureInstance.get(GET_EXISTING_USERS_FOR_FOLDER_ACCESS(knowledgeBaseId, page, count));
    return { success: true,  message: response?.data?.message, response: response };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
}

export const grantAccessToUsers = async (id, requestBody) => {
  try {
    const response = await axiosSecureInstance.post(GRANT_ACCESS_TO_USERS(id), requestBody);
    return { success: true,  message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const removeAccessToUsers = async (id, requestBody) => {
  try {
    const response = await axiosSecureInstance.post(REMOVE_ACCESS_TO_USERS(id), requestBody);
    return { success: true,  message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};