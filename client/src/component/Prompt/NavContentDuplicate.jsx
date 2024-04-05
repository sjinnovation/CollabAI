import React, { useContext, useEffect, useMemo, useState } from "react";
import NavLinksContainer from "./NavLinksContainer";
import NavPrompt from "./NavPrompt";
import NewChat from "./NewChat";
import { getUserID } from "../../Utility/service";
import { SidebarContext } from "../../contexts/SidebarContext";
import Scrollbars from "rc-scrollbars";
import { FaSearch } from "react-icons/fa";
import { categorizePrompts } from "../../Utility/helper";
import { getChatThread } from "../../api/threadApiFunctions";



const NavContentDuplicate = ({
  setChatLog,
  chatLog,
  setShowMenu,
  triggerUpdate,
}) => {
  const [chatThread, setChatThread] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const userid = getUserID();

  // context values
  const { removeThreadId, setRemoveThreadId } = useContext(SidebarContext);

  const handleGetChatThread = async () => {
    try {
      const { success, data, error } = await getChatThread(userid, setChatThread);
      if (success) {
        setChatThread(data);
        console.log(data,"ghjkghjjhb")
      } else {
        setChatThread([]);
        console.error("Error fetching chat thread:", error);
      }
    } finally {
      
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
  }, [triggerUpdate]);

  
  useEffect(() => {
    if (removeThreadId) {
      handleRemoveThread(removeThreadId);
    }
  }, [removeThreadId]);

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
                chatLog={chatThread}
                setChatLog={setChatThread}
              />
            )
        )}
      </div>
    ));
  };

  const renderPromptsByCategory = (prompts, category) => {
    console.log(category);
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
              data.promptresponse && (
                <NavPrompt
                  key={data.threadid}
                  chatPrompt={data.description}
                  threadId={data.threadid}
                  threadIndex={index}
                  chatLog={chatThread}
                  setChatLog={setChatThread}
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

  // Filter data based on search term
  const filteredData = chatThread?.filter((thread) => {
    if (thread.prompttitle) {
      return thread.prompttitle.toLowerCase().includes(searchTerm.toLowerCase())
    } else {

      return thread.description.toLowerCase().includes(searchTerm.toLowerCase())
    }
  }
  );

  const categorizedChatThreads = useMemo(() => {
    if (filteredData?.length) {
      const chats = categorizePrompts(filteredData);
      return chats;
    } else return {};
  }, [filteredData]);



  return (
    <>
      <Scrollbars
        autoHide
        autoHideTimeout={1000}
        autoHideDuration={200}
        style={{ width: "260px", height: "65vh", border: "none" }}
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
            width: "100%",
            border: "none",
          }}
        >
          <NewChat />
          <div class="input-group input-group-sm mb-3">
            <span class="input-group-text thread-search" id="basic-addon1"><FaSearch /></span>
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

          {Object.entries(categorizedChatThreads).map(([category, prompts]) =>
            (Array.isArray(prompts) && prompts.length) ||
              (typeof prompts === "object" && Object.keys(prompts).length)
              ?
              renderPromptsByCategory(prompts, category)
              : null
          )}
        </div>
      </Scrollbars>

      <NavLinksContainer chatLog={chatThread} setChatLog={setChatThread} />
    </>
  );
};

export default NavContentDuplicate;
