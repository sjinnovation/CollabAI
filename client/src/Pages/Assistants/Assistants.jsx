import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";
import Avatar from "../../component/Prompt/Avatar";
import BotResponse from "../../component/Prompt/BotResponse";
import Error from "../../component/Prompt/Error";
import Loading from "../../component/Prompt/Loading";
import SvgComponent from "../../component/Prompt/SvgComponent";
import { axiosOpen, axiosSecureInstance } from "../../api/axios";
import { getUserID ,getUserRole, getUserEmail } from "../../Utility/service";
import { useNavigate, useParams } from "react-router-dom";
import { SidebarContext } from "../../contexts/SidebarContext";
import { toast } from "react-hot-toast";
import { HiOutlineUpload } from "react-icons/hi";
import { CgAttachment } from "react-icons/cg";
import { MdDeleteOutline } from "react-icons/md";
import { assistantAccessScopes } from "../../constants/AssistantAccessConstants";
import InfiniteScroll from "react-infinite-scroll-component";
import AssistantChatLoading from "./AssistantChatLoading";
import { FaArrowDown } from "react-icons/fa";
import { AssistantContext } from "../../contexts/AssistantContext";
import IntroSection from "../../component/Prompt/Introsection"

const initialChatMetaData = {
  has_more: false,
  first_id: false,
  last_id: false,
}

const Assistants = () => {
  const { assistant_id, assistant_name, thread_id } = useParams();

  // --------- local states ----------
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploadingFile, SetIsUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const [inputPrompt, setInputPrompt] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [chatMetaData, setChatMetaData] = useState(initialChatMetaData);
  const [err, setErr] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const [assistantData, setAssistantData] = useState(null);   
  const [initialConversation, setInitialConversation] = useState(true);
  // loading states
  const [responseFromAPI, setReponseFromAPI] = useState(false);
  const [isMessageFetching, setIsMessageFetching] = useState(false);
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);

  // ---------- context values ---------
  // const { PromptTemplateTrigger, currentPromptTemplate } = useContext(
  //     PromptTemplateContext
  // );

  const { setShowMenu } = useContext(SidebarContext);
  const { setTriggerUpdateThreads } = useContext(AssistantContext);
 
  // ---------- hook variables ---------
  const chatLogWrapperRef = useRef(null);
  const navigate = useNavigate();

  // ---------- constants ---------
  const userid = getUserID();
  const userRole = getUserRole();
  const userEmail = getUserEmail();

  useEffect(() => {
    const scrollableDiv = chatLogWrapperRef.current;
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", handleScrollToBottomButton);
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener("scroll", handleScrollToBottomButton);
      }
    };
  }, [chatLogWrapperRef.current]);

  // ---------- side effect ---------

  useEffect(() => {
    console.log('[MOUNT] assistants')
    if(thread_id && !isFirstMessage) {
      setChatLog([]);
      setChatMetaData(initialChatMetaData);
      handleFetchAssistantChats(false, false, thread_id);
      setInitialConversation(false)
    } else if(thread_id && isFirstMessage) {
      setIsFirstMessage(false);
    } 
    else if(!thread_id) {
      setChatLog([]);
      setChatMetaData(initialChatMetaData);
      setIsFirstMessage(false);
    }
    
    return () => { console.log('[UNMOUNT] assistants')};
  }, [thread_id]);

  const chatLogMemo = useMemo(() => [...chatLog], [chatLog]);

  // local logics
  const handleFileChange = (e) => {
    e.stopPropagation();
    const files = e.target.files;
    const newFiles = Array.from(files);
    setSelectedFiles([...newFiles]);
  };

  const handleFileRemove = (file) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((f) => f.name !== file.name)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      return setInputPrompt((prevText) => prevText + "\n");
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // --------- api calls ---------
   // [GET] - @desc: handles fetching all the chats for the assistant and current thread
  const handleFetchAssistantChats = async (limit = false, after = false, threadId) => {
    if(!threadId) return;

    let query = `thread_id=${threadId}&limit=${limit || 30}`;

    if (after) {
      query += `&after=${after}`;
    }

    try {
      setIsMessageFetching(true);

      const response = await axiosSecureInstance.get(
        `api/assistants/${assistant_id}/chats?${query}`
      );

      if (response.data.messages) {
        setChatLog((prevChatLog) => {
          if (prevChatLog.length) {
            if (chatMetaData?.first_id !== response.data.metadata?.first_id) {
              return [...prevChatLog, ...response.data.messages];
            } else {
              return prevChatLog;
            }
          } else {
            return response.data.messages;
          }
        });
        setChatMetaData(response.data.metadata);
      }
    } catch (error) {
      console.log(
        "🚀 ~ file: Assistants.jsx:94 ~ handleFetchAssistantChats ~ error:",
        error
      );
    } finally {
      setIsMessageFetching(false);
    }
  };
  //get assistant converstaion starter on mount 
   const fetchAssistantData = async () => {
    try {
      const response = await axiosSecureInstance.get(
        `api/assistants/${assistant_id}/info`
      );
      const result = response.data;
      console.log("assistant data:", result.assistant.static_questions);
      setAssistantData(result?.assistant?.static_questions);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchAssistantData();
  }, []);



  // [POST] - @desc: handles new chat creation for the assistant
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      if (!responseFromAPI) {
        if (inputPrompt.trim() !== "") {
          let userPrompt = inputPrompt;
          setReponseFromAPI(true);
          setInputPrompt("");
          setInitialConversation(false);
          setChatLog([{ chatPrompt: userPrompt }, ...chatLog]);

          try {
            let isFistThreadMessage = false;
            const reqBody = {
              question: userPrompt,
            }

            if(thread_id) {
              reqBody.thread_id = thread_id;
            } else {
              isFistThreadMessage = true;
            }

            const response = await axiosSecureInstance.post(
              `api/assistants/${assistant_id}/chats`,
              reqBody
            );
            const data = response.data.response;

            if(data) {
              setChatLog([
                {
                  chatPrompt: userPrompt,
                  botMessage: data,
                  msg_id: response.data.msg_id,
                },
                ...chatLog,
              ]);
              e.target.blur();
              // updating threads, if this is the first message for this thread.
              if(isFistThreadMessage) {
                setIsFirstMessage(true);
                setTriggerUpdateThreads(true);
                navigate(`${response.data.thread_id}`);
              }
            }
          } catch (error) {
            console.error(
              "Error occurred while making the API request:",
              error
            );
            toast.error(
              "Error occurred while making the API request, please reload or try again."
            );
            setErr({
              message:
                "Error occurred while making the API request, please reload or try again.",
            });
          } finally {
            setReponseFromAPI(false);
            
            scrollToBottom();
          }
        }
      }
    } catch (error) {
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.msg.includes("No active Subscription found")
      ) {
        alert("No Active Subscription Found");
        setChatLog([]);
        setReponseFromAPI(false);
        return;
      }
    }
  };

  // [POST] - @desc: handles uploading files to the assistant
  const handleUploadFilesForAssistant = async (e) => {
    e.stopPropagation();
    if (!selectedFiles.length) return;
    try {
      SetIsUploadingFile(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axiosOpen.post(
        `api/assistants/${assistant_id}/files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSelectedFiles([]);
      toast("Files uploaded to the assistant successfully.");
    } catch (error) {
      console.error("Error uploading files:", error.message);
      toast(error.message);
    } finally {
      SetIsUploadingFile(false);
    }
  };

  // ---------- helper functions ---------
  const scrollToBottom = () => {
    if (chatLogWrapperRef.current) {
      chatLogWrapperRef.current.scrollTo({
        top: chatLogWrapperRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleScrollToBottomButton = () => {
    const scrollableDiv = chatLogWrapperRef.current;

    if (scrollableDiv) {
      const isScrolledUp = scrollableDiv.scrollTop < 0;
      const isAtBottom = scrollableDiv.scrollTop === 0;

      setShowScrollToBottomButton(isScrolledUp && !isAtBottom);
    }
  };

  // determines access scope for attachments
  const checkFileAttachmentAccess = () => {
    if (userRole === "superadmin") return true;

    const accessScope = assistantAccessScopes[assistant_id];
    if (accessScope?.fileAttachmentEligible?.includes(userEmail.toLowerCase()))
      return true;

    return false;
  };

  return (
    <>
      <header>
        <div className="menu">
          <button onClick={() => setShowMenu((state) => !state)}>
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="#d9d9e3"
              strokeLinecap="round"
            >
              <path d="M21 18H3M21 12H3M21 6H3" />
            </svg>
          </button>
        </div>
      </header>
      <div className="outer-div">
        <section className="assistantChatBox d-flex flex-column justify-content-between">
          {/* -----[START] CHAT BOX - ASSISTANT TITLE ----- */}
          <div className="assistantChatHeadWrapper">
            You're chatting with {assistant_name.split("-").join(" ")}
          </div>
          {/* -----[END] CHAT BOX - ASSISTANT TITLE ----- */}

          {/* -----[START] CHAT BOX - ALL PROMPTS ----- */}
          {isMessageFetching ? (
            <AssistantChatLoading />
          ) : (
            <div
              id="assistantScrollableDiv"
              key="assistantScrollableDiv"
              ref={chatLogWrapperRef}
            >
              {initialConversation &&
                assistantData &&
                assistantData.length > 0 && (
                  <IntroSection
                    setInputPrompt={setInputPrompt}
                    staticQuestions={assistantData}
                  />
                )}

              <InfiniteScroll
                dataLength={chatLogMemo.length}
                next={() => {
                  handleFetchAssistantChats(
                    false,
                    chatMetaData?.last_id,
                    thread_id
                  );
                }}
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                }} //To put endMessage and loader to the top.
                inverse={true} //
                hasMore={chatMetaData?.has_more}
                loader={<AssistantChatLoading />}
                scrollableTarget="assistantScrollableDiv"
              >
                {chatLogMemo.length > 0 &&
                  chatLogMemo.map((chat, idx) => (
                    <div
                      className="chatLog"
                      key={chat.msg_id}
                      // ref={idx === 0 ? topChatLogRef : null}
                    >
                      <div className="chatPromptMainContainer">
                        <div
                          className="chatPromptWrapper"
                          style={{
                            maxWidth: "48rem",
                          }}
                        >
                          <Avatar bg="#5437DB" className="userSVG">
                            <svg
                              stroke="currentColor"
                              fill="none"
                              strokeWidth={1.9}
                              viewBox="0 0 24 24"
                              // strokeLinecap="round"
                              // strokeLinejoin="round"
                              className="h-6 w-6"
                              height={40}
                              width={40}
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx={12} cy={7} r={4} />
                            </svg>
                          </Avatar>

                          <div id="chatPrompt" className="text-wrap">
                            <pre>{chat.chatPrompt}</pre>
                          </div>
                        </div>
                      </div>

                      <div className="botMessageMainContainer">
                        <div
                          className="botMessageWrapper"
                          style={{
                            maxWidth: "48rem",
                          }}
                        >
                          <Avatar bg="#11a27f" className="openaiSVG">
                            <SvgComponent w={41} h={41} />
                          </Avatar>
                          {chat.botMessage ? (
                            <div id="botMessage">
                              <BotResponse
                                response={chat.botMessage}
                                // chatLogRef={
                                //     chatLogRef
                                // }
                              />
                            </div>
                          ) : err ? (
                            <Error err={err} />
                          ) : (
                            <Loading />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                {showScrollToBottomButton && (
                  <button
                    onClick={scrollToBottom}
                    className="AssistantScrollUpButton"
                  >
                    <FaArrowDown />
                  </button>
                )}
              </InfiniteScroll>
            </div>
          )}
          {/* -----[END] CHAT BOX - ALL PROMPTS ----- */}

          {/* -----[START] CHAT BOX - SUBMIT INPUT ----- */}
          <form onSubmit={handleSubmit}>
            <div
              className="assistantInputPromptWrapper"
              style={{ width: "48rem", resize: "none" }}
            >
              {/* -----[START] CHAT BOX - SELECTED FILE LIST ----- */}
              {selectedFiles.length ? (
                <>
                  <div className="assistantInputFilesContainer">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="assistantInputFile">
                        <small className="text-truncate">{file.name}</small>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileRemove(file);
                          }}
                          disabled={isUploadingFile}
                        >
                          <MdDeleteOutline />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              <div className="d-flex flex-column w-100">
                <textarea
                  autoComplete="off"
                  placeholder="Ask me anything ..."
                  name="inputPrompt"
                  id=""
                  className="assistantInputPromptTextarea"
                  type="text"
                  rows="2"
                  value={inputPrompt}
                  disabled={isMessageFetching}
                  onChange={(e) => {
                    setInputPrompt(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                ></textarea>

                {/* -----[START] CHAT BOX - ATTACHMENT BUTTON ----- */}
                {checkFileAttachmentAccess() ? (
                  <div className="p-2 d-flex align-items-center gap-2">
                    {/* ----- files are selected, show file upload button ----- */}
                    {selectedFiles?.length ? (
                      <div className="d-flex align-items-center gap-2">
                        {/* ----- file upload ----- */}
                        <button
                          className="assistantUploadButton px-2"
                          onClick={handleUploadFilesForAssistant}
                        >
                          {isUploadingFile ? (
                            <div
                              class="spinner-border spinner-border-sm me-1"
                              role="status"
                            >
                              <span class="visually-hidden">Loading...</span>
                            </div>
                          ) : (
                            <HiOutlineUpload />
                          )}
                          <span>Upload Selected Files</span>
                        </button>
                        {/* ----- file delete ----- */}
                        <button
                          className="assistantUploadButton px-2 text-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFiles([]);
                          }}
                          disabled={isUploadingFile}
                        >
                          <span>Clear All</span>
                          <MdDeleteOutline />
                        </button>
                      </div>
                    ) : (
                      <div>
                        {/* ----- files are not selected, show attachment button here ----- */}
                        <input
                          type="file"
                          accept="pdf/*"
                          multiple
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                        <button
                          className="assistantUploadButton p-2"
                          onClick={() => fileInputRef.current.click()}
                        >
                          <CgAttachment />
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
              <button
                aria-label="form submit"
                id="assistant-input-button"
                className="assistantCustomNewButton"
                type="submit"
              >
                <svg
                  fill="#ADACBF"
                  width={15}
                  height={20}
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#212023"
                  strokeWidth={0}
                >
                  <title>{"submit form"}</title>
                  <path
                    d="m30.669 1.665-.014-.019a.73.73 0 0 0-.16-.21h-.001c-.013-.011-.032-.005-.046-.015-.02-.016-.028-.041-.05-.055a.713.713 0 0 0-.374-.106l-.05.002h.002a.628.628 0 0 0-.095.024l.005-.001a.76.76 0 0 0-.264.067l.005-.002-27.999 16a.753.753 0 0 0 .053 1.331l.005.002 9.564 4.414v6.904a.75.75 0 0 0 1.164.625l-.003.002 6.259-4.106 9.015 4.161c.092.043.2.068.314.068H28a.75.75 0 0 0 .747-.695v-.002l2-27.999c.001-.014-.008-.025-.008-.039l.001-.032a.739.739 0 0 0-.073-.322l.002.004zm-4.174 3.202-14.716 16.82-8.143-3.758zM12.75 28.611v-4.823l4.315 1.992zm14.58.254-8.32-3.841c-.024-.015-.038-.042-.064-.054l-5.722-2.656 15.87-18.139z"
                    stroke="none"
                  />
                </svg>
              </button>
            </div>
          </form>
          {/* -----[END] CHAT BOX - SUBMIT INPUT ----- */}
        </section>
      </div>
    </>
  );
};

export default React.memo(Assistants);
