// AssistantContext.js
import { useState, createContext, useEffect } from "react";
import { getAssistants } from "../api/assistantApiFunctions";
import { axiosSecureInstance } from "../api/axios";
import { SEARCH_ASSISTANTS } from "../api/assistant_api_constant";

export const AssistantContext = createContext({
  triggerUpdateThreads: true, 
  setTriggerUpdateThreads: () => {},
  deletedAssistantThreadId: null,
  setDeletedAssistantThreadId: () => {},
  assistants: [],
  setAssistants: () => {},
  totalPage: 0,
  setTotalPage: () => {},
  page: 1,
  setPage: () => {},
  loading: false,
  setLoading: () => {},
  handleFetchAssistants: () => {},
  triggerRefetchAssistants: () => {},
  fetchSearchedAssistants: () => {},
  setSearchQuery: () => {},
  searchQuery: "",
  assistantIdLinked: "",
  setAssistantIdLinked: () => {},
  assistantSelected: false,
  setAssistantSelected: () => {},
  addAssistantName: "",
  setAddAssistantName: () => {},
  setIsResponseThreadFound : () => {},
});

function AssistantContextProvider(props) {
  const [triggerUpdateThreads, setTriggerUpdateThreads] = useState(true);
  const [deletedAssistantThreadId, setDeletedAssistantThreadId] = useState(null);
  const [isResponseThreadFound, setIsResponseThreadFound] = useState(false);
  const [assistants, setAssistants] = useState([]);
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [assistantSelected, setAssistantSelected] = useState(false);
  const [assistantIdLinked, setAssistantIdLinked] = useState("");
  const [addAssistantName, setAddAssistantName] = useState("");

  useEffect(() => {
    handleFetchAssistants();
  }, [page, searchQuery]);

  const handleFetchAssistants = async () => {
    try {
      const { success, data, error } = await getAssistants(
        page,
        setAssistants,
        setTotalPage,
        setLoading,
        searchQuery
      );
      if (success) {
        console.log("Assistants fetched successfully for navbar.");
      } else {
        console.error("Error fetching assistants:", error);
      }
    } finally {}
  };

  const triggerRefetchAssistants = () => {
    console.log("Triggering refetch of assistants");
    setAssistants([]);
    setTotalPage(0);
    if (page === 1) {
      handleFetchAssistants();
    } else {
      setPage(1);
    }
  };

  const fetchSearchedAssistants = async (searchQuery) => {
    try {
      const response = await axiosSecureInstance.get(
        SEARCH_ASSISTANTS(searchQuery)
      );
      setAssistants(response.data?.assistants);
      console.log("fetchSearchedAssistants", response.data?.assistants);
    } catch (error) {
      console.log(error);
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
    triggerRefetchAssistants,
    fetchSearchedAssistants,
    setSearchQuery,
    searchQuery,
    assistantIdLinked,
    setAssistantIdLinked,
    assistantSelected,
    setAssistantSelected,
    addAssistantName,
    setAddAssistantName,
    isResponseThreadFound, 
    setIsResponseThreadFound
  };

  return (
    <AssistantContext.Provider value={contextData}>
      {props.children}
    </AssistantContext.Provider>
  );
}

export default AssistantContextProvider;