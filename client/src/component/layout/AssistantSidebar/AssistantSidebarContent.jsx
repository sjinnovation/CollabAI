import React, { useContext, useEffect, useMemo, useState } from "react";
import Scrollbars from "rc-scrollbars";
import NavLinksContainer from "../../Prompt/NavLinksContainer";
import { getUserID } from "../../../Utility/service";
import { debounce } from "lodash";
import { axiosSecureInstance } from "../../../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import AssistantNewChat from "./AssistantNewChat";
import AssistantThread from "./AssistantThread";
import { AssistantContext } from "../../../contexts/AssistantContext";
import { categorizeThreads } from "../../../Utility/helper";
import { FaSearch } from "react-icons/fa";
import { getAssistantChatThread } from "../../../api/assistantApiFunctions";

const AssistantSidebarContent = () => {
    const { assistant_name, assistant_id, thread_id } = useParams();

    const [chatThread, setChatThread] = useState([]);
    const [searchByTitle, setSearchByTitle] = useState("");

    const userid = getUserID();
    const navigate = useNavigate();

    // context values
    const {
        triggerUpdateThreads,
        setTriggerUpdateThreads,
        deletedAssistantThreadId,
        setDeletedAssistantThreadId,
    } = useContext(AssistantContext);

    const handleGetChatThread = async () => {
        try {
          await getAssistantChatThread(assistant_id, setChatThread, setTriggerUpdateThreads);
        } catch (error) {
          console.error("Error fetching chat thread:", error);
        }
      };

    // console.log(index);
    // async function getChatThread() {
    //     try {
    //         const response = await axiosSecureInstance.get(
    //             `api/assistants/threads?assistant_id=${assistant_id}`
    //         );

    //         if (response?.data?.threads) {
    //             setChatThread(response.data.threads);
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         setChatThread([]);
    //     } finally {
    //         setTriggerUpdateThreads(false);
    //     }
    // }

    // @desc: removes the assistant thread by filtering
    const handleRemoveThread = (threadId) => {
        if (chatThread.length && threadId) {
            setChatThread((prevThreads) =>
                prevThreads.filter((thread) => thread._id !== threadId)
            );
            setDeletedAssistantThreadId(null);
            navigate(`/assistants/${assistant_name}/${assistant_id}`);
        }
    };

    useEffect(() => {
        if (triggerUpdateThreads) {
            handleGetChatThread();
        }
        if (deletedAssistantThreadId) {
            handleRemoveThread(deletedAssistantThreadId);
        }
    }, [triggerUpdateThreads, deletedAssistantThreadId]);

    useEffect(() => {
        if (assistant_id) {
            setChatThread([]);
            handleGetChatThread();
        }
    }, [assistant_id]);

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
                {renderThreads(prompts)}
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
                    {renderThreads(prompts)}
                </div>
            );
        }
    };

    const renderThreads = (prompts) => {
        if (!prompts.length) return null;
        return (
            <>
                {prompts.map(
                    (data, index) =>
                        data.thread_id && (
                            <AssistantThread
                                key={data._id}
                                title={data?.title || data?.thread_id}
                                thread_mongo_id={data._id}
                                thread_id={data.thread_id}
                                assistant_id={data.assistant_id}
                            />
                        )
                )}
            </>
        );
    };

    const onSearchTitleChange = (value) => {
        setSearchByTitle(value);
    };
    const debouncedSearch = useMemo(
        () => debounce(onSearchTitleChange, 300),
        []
    );

    const categorizedChatThreads = useMemo(() => {
        if (searchByTitle && chatThread.length) {
            const filteredChatThreads = chatThread.filter((thread) =>
                thread.title.toLowerCase().includes(searchByTitle.toLowerCase())
            );
            const threads = categorizeThreads(filteredChatThreads, "updatedAt");
            return threads;
        } else if (chatThread.length) {
            const threads = categorizeThreads(chatThread, "updatedAt");
            return threads;
        } else return {};
    }, [chatThread, searchByTitle]);

    return (
        <>
            <Scrollbars
                // This will activate auto hide
                autoHide
                // Hide delay in ms
                autoHideTimeout={1000}
                // Duration for hide animation in ms.
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
                    <AssistantNewChat />
                    {/* search */}
                    <div className="input-group input-group-sm mb-3">
                        <span
                            className="input-group-text thread-search"
                            id="basic-addon1"
                        >
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            className="form-control thread-search"
                            placeholder="Search Thread"
                            aria-label="Username"
                            aria-describedby="basic-addon1"
                            onChange={(e) => debouncedSearch(e.target.value)}
                        />
                    </div>
                    {Object.entries(categorizedChatThreads).map(
                        ([category, prompts]) =>
                            (Array.isArray(prompts) && prompts.length) ||
                            (typeof prompts === "object" &&
                                Object.keys(prompts).length)
                                ? renderPromptsByCategory(prompts, category)
                                : null
                    )}
                </div>
            </Scrollbars>
            <NavLinksContainer
                chatLog={chatThread}
                setChatLog={setChatThread}
            />
        </>
    );
};

export default AssistantSidebarContent;
