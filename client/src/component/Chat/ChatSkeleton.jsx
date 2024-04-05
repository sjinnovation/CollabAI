import React from "react";

const ChatSkeleton = () => {

    const ParagraphPlaceholder = ({ size }) => {
        return  <span class={`placeholder col-${size} placeholder-sm rounded`} />
    }

    return (
        <>
            <div className="chatLog">
                <div className="chatPromptMainContainer">
                    <div
                        className="chatPromptWrapper"
                        style={{ maxWidth: "48rem" }}
                    >
                        <div className="userSVG placeholder-glow row">
                            <div
                                style={{ width: 70, height: 70 }}
                                className="placeholder col-12 rounded-circle w-10"
                            ></div>
                        </div>
                        <div
                            id="chatPrompt"
                            className="text-wrap placeholder-glow row align-items-center w-100 gap-2"
                        >
                            {
                                [5, 2].map((size, paraIdx) => <ParagraphPlaceholder key={paraIdx} size={size} />)
                            }
                        </div>
                    </div>
                </div>

                <div className="botMessageMainContainer">
                    <div
                        className="botMessageWrapper"
                        style={{ maxWidth: "48rem" }}
                    >
                        <div className="userSVG placeholder-glow row">
                            <div
                                style={{ width: 70, height: 70 }}
                                className="placeholder col-12 rounded-circle w-10"
                            ></div>
                        </div>
                        <div
                            id="botMessage"
                            className="text-wrap placeholder-glow row align-items-center w-100 gap-2"
                        >
                            {
                                [7, 4, 4, 6, 8].map((size, paraIdx) => <ParagraphPlaceholder key={paraIdx} size={size} />)
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChatSkeleton;
