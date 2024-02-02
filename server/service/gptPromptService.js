// function to generate previous chat history context array
export const generatePrevChatHistoryContext = (chatHistory) => {
    const maxChatHistoryCount = 6;
    const contextArray = [];
    let chatHistoryCount = 0;

    for (let i = chatHistory.length - 1; i >= 0; i--) {
        const chatItem = chatHistory[i];

        if (chatItem.botMessage && chatHistoryCount < maxChatHistoryCount) {
            contextArray.unshift({
                role: "assistant",
                content: chatItem.botMessage,
            });
            contextArray.unshift({
                role: "user",
                content: chatItem.chatPrompt,
            });
            chatHistoryCount++;
        }

        if (chatHistoryCount === maxChatHistoryCount) {
            break;
        }
    }

    return contextArray;
}