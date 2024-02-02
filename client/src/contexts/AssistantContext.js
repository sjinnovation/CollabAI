import { useState, createContext, useEffect } from "react";
import { getAssistants } from "../api/assistantApiFunctions";

export const AssistantContext = createContext();

function AssistantContextProvider(props) {
    const [triggerUpdateThreads, setTriggerUpdateThreads] = useState(true);
    const [deletedAssistantThreadId, setDeletedAssistantThreadId] = useState(null);
    const [assistants, setAssistants] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        handleFetchAssistants()
    }, [page]);

    const handleFetchAssistants = async () => {
      try {
        const { success, data, error } = await getAssistants(
          page,
          setAssistants,
          setTotalPage,
          setLoading
        );
        if (success) {
          console.log("Assistants fetched successfully for navbar.");
        } else {
          console.error("Error fetching assistants:", error);
        }
      } finally {
      }
    };

    const triggerRefetchAssistants = () => {
        console.log("Triggering refetch of assistants");
        setAssistants([]);
        setTotalPage(0);
        if(page === 1) {
            handleFetchAssistants();
        } else {
            setPage(1);
        }
    };

    const contextData = {
        triggerUpdateThreads,
        setTriggerUpdateThreads,
        deletedAssistantThreadId,
        setDeletedAssistantThreadId,
        assistants,
        setAssistants,
        totalPage,
        setTotalPage,
        page,
        setPage,
        loading,
        setLoading,
        handleFetchAssistants,
        triggerRefetchAssistants
    };

    return (
        <AssistantContext.Provider value={contextData}>
            {props.children}
        </AssistantContext.Provider>
    );
}

export default AssistantContextProvider;
