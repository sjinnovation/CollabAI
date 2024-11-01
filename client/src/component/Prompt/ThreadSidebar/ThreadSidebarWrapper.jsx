import React, { useContext, useEffect, useMemo, useState } from "react";
import NavLinksContainer from "../NavLinksContainer";
import Scrollbars from "rc-scrollbars";
import { FaSearch } from "react-icons/fa";
import NavPrompt from "../NavPrompt";
import { categorizePrompts } from "../../../Utility/helper";
import { getUserID } from "../../../Utility/service";
import { AssistantContext } from "../../../contexts/AssistantContext";
import { getChatThread } from "../../../api/threadApiFunctions";
import { SidebarContext } from "../../../contexts/SidebarContext";
import { useNavigate } from "react-router-dom";
import { Empty } from "antd";

const ThreadSidebarWrapper = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [chatThread, setChatThread] = useState([]);
  const { showMenu, setShowMenu, threadRestore, setThreadRestore } = useContext(SidebarContext);
  const [count, setCount] = useState(0);
  const [threadLength, setThreadLength] = useState(0);
  const userid = getUserID();
  const {
    deletedAssistantThreadId,
    triggerUpdateThreads,
    setTriggerUpdateThreads,
    assistantSelected,
    assistantIdLinked,
    addAssistantName,
  } = useContext(AssistantContext);

  // context values
  const { removeThreadId, setRemoveThreadId, triggerNavContent } =
    useContext(SidebarContext);

  const handleGetChatThread = async () => {
    setCount((prevState) => prevState + 1);
    try {
      const { success, data, error } = await getChatThread(
        userid,
        setChatThread
      );

      if (success) {
        setThreadLength(data?.length);
        setChatThread(data);
        if (count > 1) {
          if (data.length > threadLength) {
            if (threadRestore === true) {
              console.log(threadRestore);
              setThreadRestore(false);
              return false;
            }

            setShowMenu(true);
            setThreadLength(data?.length);
          } else {
            // setShowMenu(false);
            setThreadLength(data?.length);
          }
          console.log("ok");
        }
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
  }, [triggerNavContent, triggerUpdateThreads, deletedAssistantThreadId]);

  useEffect(() => {
    if (removeThreadId) {
      handleRemoveThread(removeThreadId);
    }
    if (deletedAssistantThreadId) {
      navigate("/chat");
    }
  }, [removeThreadId, deletedAssistantThreadId]);

  // Function to handle search term change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter data based on search term
  const filteredData =
    assistantSelected == false
      ? chatThread?.filter((thread) => {
          if (thread.prompttitle) {
            return thread?.prompttitle
              ?.toLowerCase()
              ?.includes(searchTerm?.toLowerCase());
          } else {
            return thread?.description
              ?.toLowerCase()
              ?.includes(searchTerm?.toLowerCase());
          }
        })
      : chatThread?.filter((thread) => {
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
        });

  const renderMonthlyPrompts = (monthlyPrompts) => {
    return Object.entries(monthlyPrompts).map(([monthYear, prompts]) => (
      <div key={monthYear} className="mb-4">
        <div className="d-flex w-100 align-items-center">
          <hr style={{ width: "15%" }} />
          <small
            style={{
              fontSize: "0.75rem",
              lineHeight: "1rem",
              padding: "0.5rem",
              whiteSpace: "nowrap",
            }}
            className="text-capitalize text-secondary"
          >
            {monthYear}
          </small>
          <hr style={{ width: "100%" }} />
        </div>
        {prompts.map(
          (data, index) =>
            data.promptresponse && (
              <NavPrompt
                key={data.threadid}
                chatPrompt={data?.prompttitle ?? data.description}
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
          <div className="d-flex w-100 align-items-center">
            <hr style={{ width: "15%" }} />
            <small
              style={{
                fontSize: "0.75rem",
                lineHeight: "1rem",
                padding: "0.5rem",
                whiteSpace: "nowrap",
              }}
              className="text-capitalize text-secondary"
            >
              {category}
            </small>
            <hr style={{ width: "100%" }} />
          </div>
          {prompts.map(
            (data, index) =>
              (data.promptresponse || data.description) && (
                <NavPrompt
                  key={data.threadid}
                  chatPrompt={data?.prompttitle ?? data.description}
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

  const categorizedChatThreads = useMemo(() => {
    if (filteredData?.length) {
      const chats = categorizePrompts(filteredData);
      return chats;
    } else return {};
  }, [filteredData]);

  return (
    <>
      <div className="add-assistant-name-container mx-4 pt-3">
        {" "}
        <p>
          {assistantIdLinked
            ? `${addAssistantName}'s thread`
            : "Agent and Multi-provider threads"}
        </p>{" "}
      </div>

      <div class="input-group input-group-sm mb-1 px-3">
        <span class="input-group-text thread-search" id="basic-addon1">
          <FaSearch />
        </span>
        <input
          type="text"
          class="form-control thread-search"
          placeholder="Search thread"
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
        style={{ width: "100%", height: "78vh", border: "none" }}
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
          {Object.keys(categorizedChatThreads).length === 0 ? (
            <>
              <br />
              <br />
              <br />
              <br />
              <pre className="thread-no-data">
                 <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </pre>
            </>
          ) : (
            <>
              {Object.entries(categorizedChatThreads).map(
                ([category, prompts]) =>
                  (Array.isArray(prompts) && prompts.length) ||
                  (typeof prompts === "object" && Object.keys(prompts).length)
                    ? renderPromptsByCategory(prompts, category)
                    : null
              )}
            </>
          )}
        </div>
      </Scrollbars>
    </>
  );
};

export default ThreadSidebarWrapper;
