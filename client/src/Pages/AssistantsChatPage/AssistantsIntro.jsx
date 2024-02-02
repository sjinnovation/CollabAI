import React, { useEffect, useState } from "react";
import { axiosOpen } from "../../api/axios";

const AssistantIntro = ({ assistant_name }) => {
  const [templates, setTemplates] = useState([]);

  return (
    <div id="introsection">
      <div className="row mb-3">
        <center>
          <h1 className="text-white">Collaborative AI</h1>
          <h2 className="text-white fs-3 mt-4">Chat With {assistant_name.split('-').join(' ')}</h2>
        </center>
      </div>
    </div>
  );
};

export default AssistantIntro;
