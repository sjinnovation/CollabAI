import { useState, useEffect, useContext } from "react";
import Assistant from "../api/assistant";
import { message } from "antd";
import { AssistantContext } from "../contexts/AssistantContext";

const initialLoaderState = {
  ASSISTANT_UPDATING: false,
  ASSISTANT_DELETING: false,
  ASSISTANT_CREATING: false,
  ASSISTANT_LOADING: true,
  ALL_ASSISTANT_LOADING: true,
  ASSISTANT_STATS_LOADING: true,
  TEAM_LOADING: true,
};
const {
  fetchSingleUserAssistants,
  deleteAssistant,
  updateAssistant,
  fetchUsersAssistantsStats,
  fetchTeams,
  fetchAllAssistants,
  handleAssignTeam,
} = Assistant();

const useAssistantPage = () => {
  const [adminUserAssistants, setAdminUserAssistants] = useState([]);
  const [userAssistants, setUserAssistants] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [loader, setLoader] = useState({
    ...initialLoaderState,
  });

  const { triggerRefetchAssistants } = useContext(AssistantContext);

  useEffect(() => {
    handleFetchUserCreatedAssistants();
    handleFetchUserAssistantStats();
    handleFetchAllAssistants(1);
    handleFetchTeams();
  }, []);

  const handleAssignTeamToAssistant = async (assistantId, teamIds) => {
    try {
      updateLoader({ ASSISTANT_UPDATING: assistantId });
      const response = await handleAssignTeam(assistantId, teamIds, () => {
        handleFetchUserCreatedAssistants();
        handleFetchAllAssistants(1);
      });
      handleShowMessage(response);
    } catch (error) {
      handleShowMessage(error?.response?.data?.message);
    } finally {
      updateLoader({ ASSISTANT_UPDATING: false });
    }
  };

  const handleUpdateAssistant = async (assistantId, data) => {
    try {
      updateLoader({ ASSISTANT_UPDATING: assistantId });
      const response = await updateAssistant(assistantId, data);
      handleFetchUserCreatedAssistants();
      handleFetchAllAssistants(1);
      handleShowMessage(response);

      if(response?.data) {
        triggerRefetchAssistants();
      }
    } catch (error) {
      handleShowMessage(error?.response?.data?.message);
    } finally {
      updateLoader({ ASSISTANT_UPDATING: false });
    }
  };

  const handleFetchUserCreatedAssistants = async () => {
    try {
      updateLoader({ ASSISTANT_LOADING: true });
      await fetchSingleUserAssistants(1, (assistantsData) => {
        setAdminUserAssistants(assistantsData.assistants);
      });
    } catch (error) {
      handleShowMessage(error?.response?.data?.message);
    } finally {
      updateLoader({ ASSISTANT_LOADING: false });
    }
  };

  const handleFetchUserAssistantStats = async () => {
    try {
      updateLoader({ ASSISTANT_STATS_LOADING: true });
      await fetchUsersAssistantsStats((assistantsData) => {
        setUserAssistants(
          assistantsData.userStats.map((item) => {
            return {
              ...item,
              key: item._id,
              username: item.username,
              totalAssistants: item.totalAssistants,
            };
          })
        );
      });
    } catch (error) {
      handleShowMessage(error?.response?.data?.message);
    } finally {
      updateLoader({ ASSISTANT_STATS_LOADING: false });
    }
  };

  const handleDeleteAssistant = async (assistantId) => {
    try {
      updateLoader({ ASSISTANT_DELETING: assistantId });
      const response = await deleteAssistant(assistantId);
      handleFetchUserCreatedAssistants();
      handleFetchUserAssistantStats();
      handleFetchAllAssistants(1)
      handleShowMessage(response);
      
      if(response?.data) {
        triggerRefetchAssistants();
      }
    } catch (error) {
      console.log(error);
      handleShowMessage(error?.response?.data?.message);
    } finally {
      updateLoader({ ASSISTANT_DELETING: false });
    }
  };

  const handleFetchAllAssistants = async (page) => {
    try {
      updateLoader({ ALL_ASSISTANT_LOADING: true });
      await fetchAllAssistants(page, 10, (response) => {
        setAssistants(response);
      });
    } catch (error) {
      handleShowMessage(error?.response?.data?.message);
    } finally {
      updateLoader({ ALL_ASSISTANT_LOADING: false });
    }
  };

  const handleFetchTeams = async () => {
    try {
      updateLoader({ TEAM_LOADING: true });
      await fetchTeams((response) => {
        setTeamList(response);
      });
    } catch (error) {
      handleShowMessage(error?.response?.data?.message);
    } finally {
      updateLoader({ TEAM_LOADING: false });
    }
  };

  const updateLoader = (newState) => {
    setLoader((prevLoader) => ({ ...prevLoader, ...newState }));
  };

  const handleShowMessage = (response) => {
    if (response?.error) {
      message.error(response.error);
    } else if (response?.data) {
      message.success(response.data.message);
    } else {
      message.error("Something went wrong!");
    }
  };

  return {
    adminUserAssistants,
    userAssistants,
    assistants,
    teamList,
    loader,
    handleAssignTeamToAssistant,
    handleUpdateAssistant,
    handleFetchUserCreatedAssistants,
    handleFetchUserAssistantStats,
    handleDeleteAssistant,
    handleFetchAllAssistants,
    handleFetchTeams,
  };
};

export default useAssistantPage;
