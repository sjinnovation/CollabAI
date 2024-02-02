import { useState, createContext, useEffect } from "react";

export const PromptTemplateContext = createContext();

function PromptTemplateContextProvider(props) {
    const [PromptTemplateTrigger, setUpdatePromptTemplateTrigger] = useState(0);
    const [currentPromptTemplate, setCurrentPromptTemplate] = useState("")
    const triggerUpdate = () => {
        setUpdatePromptTemplateTrigger(state => state + 1);
    }
    const updateCurrentPromptTemplate = (template) => { 
        setCurrentPromptTemplate(template);
        triggerUpdate();
      }
     
    return (
        <PromptTemplateContext.Provider
            value={{
                currentPromptTemplate,
                PromptTemplateTrigger,
                triggerUpdate,
                updateCurrentPromptTemplate,
            }}>
            {props.children}
        </PromptTemplateContext.Provider>
    )
}

export default PromptTemplateContextProvider;