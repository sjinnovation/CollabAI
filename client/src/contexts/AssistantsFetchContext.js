// AssistantContext.js

import React, { createContext, useContext, useState, useEffect } from "react";
import { axiosSecureInstance } from "../api/axios";

const AssistantContext = createContext();

export function AssistantFetchContextProvider({ children }) {
  const [assist, setAssist] = useState(null);

  const [functionCallingAssistants, setFunctionCallingAssistants] = useState(
    []
  );
  const [allAssistants, setAllAssistants] = useState([]);

  const updateAssistantContext = (newAssistant) => {
    setAssist(newAssistant);
  };

  return (
    <AssistantContext.Provider
      value={{
        assist,
        setAssist,
        updateAssistantContext,
        functionCallingAssistants,
        setFunctionCallingAssistants,
        allAssistants,
        setAllAssistants
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistantContext() {
  return useContext(AssistantContext);
}
