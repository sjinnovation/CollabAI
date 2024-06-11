import React, { useCallback, useContext, useEffect, useMemo, useState, useRef } from "react";
import NavLinksContainer from "./NavLinksContainer";
import NavPrompt from "./NavPrompt";
import NewChat from "./NewChat";
import { getUserID } from "../../Utility/service";
import { SidebarContext } from "../../contexts/SidebarContext";
import Scrollbars from "rc-scrollbars";
import { FaSearch } from "react-icons/fa";
import { categorizePrompts } from "../../Utility/helper";
import { getChatThread } from "../../api/threadApiFunctions";
import { AssistantContext } from "../../contexts/AssistantContext";
import AssistantList from "../layout/NewSidebar/AssistantList";
import { useNavigate, useParams } from "react-router-dom";
import debounce from 'lodash/debounce';
import { LuLayers } from "react-icons/lu";
import "./exploreAssistant.css"
import { getSingleAssistant } from "../../api/assistantChatPageApi";
import "./NavBar.css";
import "./NavContentDuplicate.css";
import { AiOutlineAntDesign } from "react-icons/ai";
const NavContentDuplicate = ({
  setChatLog,
  chatLog,
  setShowMenu,
  triggerUpdate,
}) => {
  const [chatThread, setChatThread] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [assistantSelected, setAssistantSelected] = useState(false);
  const [assistantIdLinked, setAssistantIdLinked] = useState('');
  const [addAssistantName, setAddAssistantName] = useState('');
  const userid = getUserID();
  const {
    assistants,
    setAssistants,
    totalPage,
    setTotalPage,
    page,
    setPage,
    loading,
    setLoading,
    handleFetchAssistants,
    fetchSearchedAssistants,
    searchQuery,
    setSearchQuery,
    deletedAssistantThreadId,
    triggerUpdateThreads,
    setTriggerUpdateThreads
  } = useContext(AssistantContext);

  // context values
  const { removeThreadId, setRemoveThreadId } = useContext(SidebarContext);
  const navigate = useNavigate();
  const { assistant_id } = useParams();

  useEffect(() => {

    if (assistant_id) {
      setAssistantSelected(true);
      setAssistantIdLinked(assistant_id);
    } else {
      setAssistantSelected(false);
      setAssistantIdLinked('');
    }


    const fetchData = async () => {
      const res = await getSingleAssistant(assistantIdLinked);
      if (res?.assistant?.name) {
        setAddAssistantName(res.assistant.name);
      }
    }

    fetchData();

  }, [assistantIdLinked, window.location.pathname])


  const handleClick = () => {
    navigate('/public-assistant');
  };

  const handleGetChatThread = async () => {

    try {
      const { success, data, error } = await getChatThread(
        userid,
        setChatThread
      );

      if (success) {
        setChatThread(data);
      } else {
        setChatThread([]);
        console.error("Error fetching chat thread:", error);
      }
    } finally {
      setTriggerUpdateThreads(false);
    }
  };

  const handleRemoveThread = (threadId) => {
    if (chatThread.length && threadId) {
      setChatThread((prevThreads) =>
        prevThreads.filter((thread) => thread.threadid !== threadId)
      );
      setRemoveThreadId(false);
    }
  };

  useEffect(() => {
    handleGetChatThread();
  }, [triggerUpdate, triggerUpdateThreads, deletedAssistantThreadId]);

  useEffect(() => {
    if (removeThreadId) {
      handleRemoveThread(removeThreadId);
    }
    if (deletedAssistantThreadId) {
      navigate('/chat');
    }
  }, [removeThreadId, deletedAssistantThreadId]);

  const renderMonthlyPrompts = (monthlyPrompts) => {
    return Object.entries(monthlyPrompts).map(([monthYear, prompts]) => (
      <div key={monthYear} className="mb-4">
        <small
          style={{
            fontSize: "0.75rem",
            lineHeight: "1rem",
            padding: "0.5rem",
          }}
          className="d-block text-capitalize text-secondary"
        >
          {monthYear}
        </small>
        {prompts.map(
          (data, index) =>
            data.promptresponse && (
              <NavPrompt
                key={data.threadid}
                chatPrompt={data.description}
                threadId={data.threadid}
                threadIndex={index}
                assistantId={data.assistant_id}
                assistantThreadId={data.thread_id}
                assistantName={data.name}
                chatLog={chatThread}
                setChatLog={setChatThread}
              />
            )
        )}
      </div>
    ));
  };

  const renderPromptsByCategory = (prompts, category) => {
    if (category === "monthly") {
      return renderMonthlyPrompts(prompts);
    } else {
      return (
        <div key={category} className="mb-4">
          <small
            style={{
              fontSize: "0.75rem",
              lineHeight: "1rem",
              padding: "0.5rem",
            }}
            className="d-block text-capitalize text-secondary"
          >
            {category}
          </small>
          {prompts.map(
            (data, index) =>
              (data.promptresponse || data.description) && (
                <NavPrompt
                  key={data.threadid}
                  chatPrompt={data.description}
                  threadId={data.threadid}
                  threadIndex={index}
                  assistantId={data.assistant_id}
                  assistantThreadId={data.thread_id}
                  assistantName={data.name}
                  chatLog={chatThread}
                  setChatLog={setChatThread}
                  thread_mongo_id={data._id}
                />
              )
          )}
        </div>
      );
    }
  };

  // Function to handle search term change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAssistantSearch = useCallback(
    debounce(value => {
      setSearchQuery(value);
      setPage(1);
    }, 600),
    []);

  // Filter data based on search term
  const filteredData = (assistantSelected == false) ? (chatThread?.filter((thread) => {
    if (thread.prompttitle) {
      return thread?.prompttitle
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase());
    } else {
      return thread?.description
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase());
    }
  })) : (chatThread?.filter((thread) => {
    if (assistantIdLinked == thread.assistant_id) {
      if (thread.prompttitle) {
        return thread?.prompttitle
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase());
      } else {
        return thread?.description
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase());
      }
    }

  }));


  const categorizedChatThreads = useMemo(() => {
    if (filteredData?.length) {
      const chats = categorizePrompts(filteredData);
      return chats;
    } else return {};
  }, [filteredData]);

const retrievingUniqueAssistant = assistants.filter((assistant, index, self) =>
  index === self.findIndex((anyAssistant) => (
    anyAssistant.name === assistant.name
  ))
);



  return (
    <>
      <div style={{ padding: "0.875rem", paddingBottom: 0 }}>
        <NewChat />
      </div>
      <div onClick={handleClick} className="glyphicon glyphicon-th-large">
        <p className="fw-bold custom-size-for-explore-text "><LuLayers className="fs-5 me-2"/> Explore Assistants</p>
      </div>
      <div style={{ padding: "0.875rem", paddingTop: 0 }}>
        <div className="input-group input-group-sm mb-1">
          <span className="input-group-text thread-search" id="basic-addon1">
            <FaSearch />
          </span>
          <input
            type="text"
            className="form-control thread-search"
            placeholder="Search Assistant"
            aria-label="Username"
            aria-describedby="basic-addon1"
            // value={searchQuery}
            onChange={(e) => handleAssistantSearch(e.target.value)}
          />
        </div>



        <AssistantList
          propsData={{
            assistants ,
            setAssistants,
            page,
            totalPage,
            loading,
            actions: {
              setPage,
            },
            setAssistantSelected,
            setAssistantIdLinked,
            handleFetchAssistants,
          }}
        />
      </div>
      <>
        <div className="add-assistant-name-container mx-4">  <p>{assistantIdLinked ? `${addAssistantName}'s thread` : "Assistant and Multi-provider threads"}</p> </div>

        <div class="input-group input-group-sm mb-1 px-3">


          <span class="input-group-text thread-search" id="basic-addon1">
            <FaSearch />
          </span>
          <input
            type="text"
            class="form-control thread-search"
            placeholder="Search Thread"
            aria-label="Username"
            aria-describedby="basic-addon1"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          style={{ width: "260px", height: "78vh", border: "none" }}
          renderThumbVertical={({ style, ...props }) => (
            <div
              {...props}
              style={{
                ...style,
                cursor: "pointer",
                backgroundColor: "rgba(255,255,255,.25)",
              }}
            />
          )}
        >
          <div
            style={{
              padding: "0.875rem",
              paddingTop: 0,
              width: "100%",
              border: "none",
            }}
          >

            {
              (Object.keys(categorizedChatThreads).length === 0) ? (
                <>
                  <br /><br /><br /><br />
                  <pre className="thread-no-data">No threads have been generated yet</pre>

                </>

              ) : (
                <>

                  {Object.entries(categorizedChatThreads).map(([category, prompts]) =>
                    (Array.isArray(prompts) && prompts.length) ||
                      (typeof prompts === "object" && Object.keys(prompts).length)
                      ? renderPromptsByCategory(prompts, category)
                      : null
                  )}


                </>
              )

            }




          </div>
        </Scrollbars>
      </>

      <NavLinksContainer chatLog={chatThread} setChatLog={setChatThread} />
    </>
  );
};

export default NavContentDuplicate;
