import { useState, useEffect, useContext } from "react";
import { message } from "antd";
import { AssistantContext } from "../contexts/AssistantContext";
import { SEARCH_ALL_ORGANIZATIONAL_ASSISTANTS_SLUG, SEARCH_ALL_USER_CREATED_ASSISTANTS_SLUG } from "../constants/Api_constants";
import { axiosSecureInstance } from "../api/axios";
import { getUserID } from "../Utility/service";
import { SEARCH_ASSISTANTS } from "../api/assistant_api_constant";
import { deleteAssistant, fetchAllAssistants, fetchAssistantStatisticsForUser, fetchAssistantsCreatedByUser, fetchTeams, updateAssistant, updateAssistantTeams } from "../api/assistant";
import { addPublicAssistant, deletePublicAssistant, isPublicStateChange, deleteSinglePublicAssistant } from "../api/publicAssistant";
import { AssistantSetAsPublic,AssistantSetAsPrivate,AssistantNeedToActiveFirst } from "../constants/PublicAndPrivateAssistantMessages";
const initialLoaderState = {
  ASSISTANT_UPDATING: false,
  ASSISTANT_DELETING: false,
  ASSISTANT_CREATING: false,
  ASSISTANT_LOADING: true,
  ALL_ASSISTANT_LOADING: true,
  ASSISTANT_STATS_LOADING: true,
  TEAM_LOADING: true,
};

const userId = getUserID();
const useAssistantPage = () => {
  const [adminUserAssistants, setAdminUserAssistants] = useState([]);
  const [userAssistants, setUserAssistants] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [functionCallingAssistants, setFunctionCallingAssistants] = useState(
    []
  );
  const [teamList, setTeamList] = useState([]);
  const [loader, setLoader] = useState({
    ...initialLoaderState,
  });
  const [totalCount, setTotalCount] = useState()
  const [orgAssistantSearchQuery, setOrgAssistantSearchQuery] = useState('')
  const [personalAssistantSearchQuery, setPersonalAssistantSearchQuery] = useState('')

  const { triggerRefetchAssistants } = useContext(AssistantContext);

  useEffect(() => {
    handleFetchUserCreatedAssistants(1);
    handleFetchUserAssistantStats();
    handleFetchAllAssistants(1);
    handleFetchFunctionCallingAssistants(1);
    handleFetchTeams();
  }, []);

  useEffect(()=>{
    handleFetchAllAssistants(1, orgAssistantSearchQuery)
  },[orgAssistantSearchQuery])

  useEffect(()=>{
    handleFetchUserCreatedAssistants(1, personalAssistantSearchQuery)
  },[personalAssistantSearchQuery])

  const updateLoader = (newState) => {
    setLoader((prevLoader) => ({ ...prevLoader, ...newState }));
  };

  const handleShowMessage = (receivedMessage) => {
    if (receivedMessage instanceof Error) {
      message.error(
        receivedMessage?.response?.data?.message || receivedMessage.message
      );
    } else if (typeof receivedMessage === "string") {
      message.success(receivedMessage);
    }
  };

  // API FUNCTIONS

  const handleAssignTeamToAssistant = async (assistantId, teamIds, successCb) => {
    updateLoader({ ASSISTANT_UPDATING: assistantId });
    try {
      const payload = { teamIds };
      const response = await updateAssistantTeams(assistantId, payload);

      if (response) {
        handleShowMessage(response.message);
        handleFetchUserCreatedAssistants();
        handleFetchFunctionCallingAssistants();
        handleFetchAllAssistants(1);
        successCb();
      }
    } catch (error) {
      handleShowMessage(error);
    } finally {
      updateLoader({ ASSISTANT_UPDATING: false });
    }
  };

  const handleUpdateAssistant = async (record, data) => {
    try {
      updateLoader({ ASSISTANT_UPDATING: record?.assistant_id });
      if(data.is_active === false){
       const deleteSinglePublicAssistantResponse =  await deleteSinglePublicAssistant(record?.assistant_id);

      }
      const response = await updateAssistant(record?._id, data);
      if(response) {
        handleFetchUserCreatedAssistants();
        handleFetchAllAssistants(1);
        handleFetchFunctionCallingAssistants();
        handleShowMessage(response.message);
        triggerRefetchAssistants();
      }
      updateLoader({ ASSISTANT_UPDATING: false });

      return response;

    } catch (error) {
      handleShowMessage(error);
    } finally {
      updateLoader({ ASSISTANT_UPDATING: false });
    }
  };

  const handleFetchUserCreatedAssistants = async (page, personalAssistantSearchQuery = null) => {    
    try {
      updateLoader({ ASSISTANT_LOADING: true });
      const response = await fetchAssistantsCreatedByUser(page, userId , personalAssistantSearchQuery);
      if(response) {
        setAdminUserAssistants(response.data);
        setTotalCount(response.meta.total);
      }
    } catch (error) {
      handleShowMessage(error);
    } finally {
      updateLoader({ ASSISTANT_LOADING: false });
    }
  };

  const handleFetchUserAssistantStats = async () => {
    try {
      updateLoader({ ASSISTANT_STATS_LOADING: true });
      const response = await fetchAssistantStatisticsForUser();

      if(response) {
        setUserAssistants(
          response.data.map((item) => {
            return {
              ...item,
              key: item._id,
              username: item.username,
              totalAssistants: item.totalAssistants,
            };
          })
        );
      }
    } catch (error) {
      handleShowMessage(error);
    } finally {
      updateLoader({ ASSISTANT_STATS_LOADING: false });
    }
  };

   //fetching all functionCalling assistants
   const handleFetchFunctionCallingAssistants = async () => {
    try {
      const response = await axiosSecureInstance.get(
        `/api/assistants/users/createdFunctionCalling`
      );

      const result = response.data.assistants;

      setFunctionCallingAssistants(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAssistant = async (assistantId) => {
    updateLoader({ ASSISTANT_DELETING: assistantId });
    try {
      const response = await deleteAssistant(assistantId);

      if(response) {
        handleFetchUserCreatedAssistants();
        handleFetchUserAssistantStats();
        handleFetchFunctionCallingAssistants();
        handleFetchAllAssistants(1);
        handleShowMessage(response.message);
        triggerRefetchAssistants();
      }
    } catch (error) {
      console.log(error);
      handleShowMessage(error);
    } finally {
      updateLoader({ ASSISTANT_DELETING: false });
    }
  };

  const handleFetchAllAssistants = async (page, orgAssistantSearchQuery) => {
    
    try {
      updateLoader({ ALL_ASSISTANT_LOADING: true });
      const response = await fetchAllAssistants(page, 10, orgAssistantSearchQuery);

      if(response) {
        setAssistants(response);
      }
    } catch (error) {
      handleShowMessage(error);
    } finally {
      updateLoader({ ALL_ASSISTANT_LOADING: false });
    }
  };

  const handleFetchTeams = async () => {
    try {
      updateLoader({ TEAM_LOADING: true });
      const response = await fetchTeams();

      if(response) {
        setTeamList(response.data);
      }
    } catch (error) {
      handleShowMessage(error);
    } finally {
      updateLoader({ TEAM_LOADING: false });
    }
  };

  const searchOrganizationalAssistants = async (searchQuery) => {
    try {
      updateLoader({ ALL_ASSISTANT_LOADING: true });
      const response = await axiosSecureInstance.get(SEARCH_ALL_ORGANIZATIONAL_ASSISTANTS_SLUG(searchQuery))
      setAssistants(response.data)
      updateLoader({ ALL_ASSISTANT_LOADING: false });
    } catch (error) {
      console.log(error)
      updateLoader({ ALL_ASSISTANT_LOADING: false });
    }

  }

  const searchPersonalAssistants = async (searchQuery) => {
    try {
      updateLoader({ ASSISTANT_LOADING: true });
      const response = await axiosSecureInstance.get(SEARCH_ALL_USER_CREATED_ASSISTANTS_SLUG(getUserID(), searchQuery))
      setAdminUserAssistants(response.data?.assistants)
      updateLoader({ ASSISTANT_LOADING: false });
    } catch (error) {
      console.log(error)
      updateLoader({ ASSISTANT_LOADING: false });
    }

  }

  const handlePublicAssistantAdd = async (id, data, checked, assistantId, isActive) => {
    updateLoader({ ASSISTANT_UPDATING: checked });
    try {
        if (checked == true && isActive == true) {
            const response = await addPublicAssistant(id, data, checked, assistantId);
            if (response?.data) {
                const resp = await isPublicStateChange(id, data, checked, assistantId);
                if (resp?.data) {
                    message.success(AssistantSetAsPublic);
                }
            }
        }else if (checked == true && isActive == false) {
          message.error(AssistantNeedToActiveFirst);
        }
         else {
            const response = await deletePublicAssistant(id, data, checked, assistantId);
            if (response?.data) {
                const resp = await isPublicStateChange(id, data, checked, assistantId);
                if (resp?.data) {
                    message.success(AssistantSetAsPrivate);
                }
            } 


            } 

        
    } catch(error) {

        handleShowMessage(error?.response?.data?.message);
    } finally {
        updateLoader({ ASSISTANT_UPDATING: !checked });
    }
    handleFetchUserCreatedAssistants();
    handleFetchAllAssistants(1);
};


  return {
    setAdminUserAssistants,
    adminUserAssistants,
    setFunctionCallingAssistants,
    functionCallingAssistants,
    totalCount,
    userAssistants,
    assistants,
    setAssistants,
    teamList,
    loader,
    handleAssignTeamToAssistant,
    handleUpdateAssistant,
    handleFetchUserCreatedAssistants,
    handleFetchUserAssistantStats,
    handleDeleteAssistant,
    handleFetchAllAssistants,
    handleFetchFunctionCallingAssistants,
    handleFetchTeams,
    updateLoader,
    searchOrganizationalAssistants,
    searchPersonalAssistants,
    //Search query for organizational assistants
    orgAssistantSearchQuery,
    setOrgAssistantSearchQuery,
    //Search query for personal assistants
    personalAssistantSearchQuery,
    setPersonalAssistantSearchQuery,
    handlePublicAssistantAdd
  };
};

export default useAssistantPage;
