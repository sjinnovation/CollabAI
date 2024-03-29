import React from "react";
import SvgComponent from "./SvgComponent";

const PromptSkeleton = () => {
  return (
    <div className="chatLog">
      <div className="chatPromptMainContainer">
        <div className="chatPromptWrapper" style={{ maxWidth: "48rem" }}>
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
            <span class="placeholder col-7 placeholder-sm rounded"></span>
            <span class="placeholder col-2 placeholder-sm rounded"></span>
          </div>
        </div>
      </div>

      <div className="botMessageMainContainer">
        <div className="botMessageWrapper" style={{ maxWidth: "52vw" }}>
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
            <span class="placeholder col-7 placeholder-sm rounded"></span>
            <span class="placeholder col-4 placeholder-sm rounded"></span>
            <span class="placeholder col-4 placeholder-sm rounded"></span>
            <span class="placeholder col-6 placeholder-sm rounded"></span>
            <span class="placeholder col-8 placeholder-sm rounded"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptSkeleton;
