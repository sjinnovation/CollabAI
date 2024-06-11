import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      {/* © 2022 - {(new Date().getFullYear())} Built with GPT-4, Designed and Developed by BuildYourAI Team */}
      AI models can make mistakes. © 2022 - {new Date().getFullYear()} | Powered
      by Geminai, ChatGPT, and Claude. <br/>Designed and Developed by BuildYourAI
      Team
    </footer>
  );
};

export default Footer;
