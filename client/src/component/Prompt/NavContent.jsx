import React, { useContext, useEffect, useState } from "react";
import NavLinksContainer from "./NavLinksContainer";
import NavPrompt from "./NavPrompt";
import NewChat from "./NewChat";
import { axiosOpen, axiosSecureInstance } from "../../api/axios";
import { getUserID } from "../../Utility/service";
import { SidebarContext } from "../../contexts/SidebarContext";

const NavContent = ({ setChatLog, chatLog, setShowMenu, triggerUpdate }) => {
    const [chatThread, setChatThread] = useState([]);
    const userid = getUserID();

  // context values
  const { removeThreadId, setRemoveThreadId } = useContext(SidebarContext);

    // console.log(index);
    async function getChatThread() {
        try {
            const response = await axiosSecureInstance.get(
                "api/prompt/fetchchatthreads/" + userid
            );
            // console.log(response.data.prompts);
            setChatThread(response.data.prompts);
        } catch (error) {
            console.log(error);
            setChatThread([]);
        }
    }

    // TODO: removed extra useEffect, that is not necessary
    // useEffect(() => {
    //     getChatThread();
    // }, []);

    // [TODO] commenting this as of now, disabling delete feature
    const handleRemoveThread = (threadId) => {
        if(chatThread.length && threadId) {
           setChatThread((prevThreads) => prevThreads.filter((thread) => thread.threadid !== threadId))
           setRemoveThreadId(false);
        }
    }
    
    useEffect(() => {
        getChatThread();
    }, [triggerUpdate]);

    // [TODO] commenting this as of now, disabling delete feature
    useEffect(() => {
        if(removeThreadId) {
            handleRemoveThread(removeThreadId)
        }
    },[removeThreadId]);

    return (
        <>
            <NewChat />
            
            <div className={`navPromptWrapper navPromptWrapperMaxHeight`}>
                {chatThread.map(
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
            <NavLinksContainer
                chatLog={chatThread}
                setChatLog={setChatThread}
            />
        </>
    );
};

export default NavContent;
