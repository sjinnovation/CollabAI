import { message } from "antd";
import { addPublicAssistant, deletePublicAssistant, isPublicStateChange, deleteSinglePublicAssistant } from "../api/publicAssistant";
import useAssistantPage from "./useAssistantPage";
import { useState } from "react";
import { AssistantSetAsPrivate,AssistantSetAsPublic } from "../constants/PublicAndPrivateAssistantMessages";
export const usePublicAssistant = () => {
    const initialLoaderState = {
        ASSISTANT_UPDATING: false,
        ASSISTANT_DELETING: false,
        ASSISTANT_CREATING: false,
        ASSISTANT_LOADING: true,
        ALL_ASSISTANT_LOADING: true,
        ASSISTANT_STATS_LOADING: true,
        TEAM_LOADING: true,
    };

    const {
        updateLoader,
        handleShowMessage,
        handleFetchAllAssistants,
        handleFetchUserCreatedAssistants,
    } = useAssistantPage();
    const [loader, setLoader] = useState({
        ...initialLoaderState,
    });

    const handlePublicAssistantAdd = async (id, data, checked, assistantId, isActive) => {
        updateLoader({ ASSISTANT_UPDATING: checked });
    
        try {
            if (checked == true && isActive == true) {
                const response = await addPublicAssistant(id, data, checked, assistantId);
                if (response?.data) {
                    const resp = await isPublicStateChange(id, data, checked, assistantId);
                    if (resp?.data) {
                        message.success(AssistantSetAsPublic);
                    }
                }
            } else {
                const response = await deletePublicAssistant(id, data, checked, assistantId);
                if (response?.data) {
                    const resp = await isPublicStateChange(id, data, checked, assistantId);
                    if (resp?.data) {
                        message.success(AssistantSetAsPrivate);
                    }
                } 


                } 

            
        } catch(error) {

            handleShowMessage(error?.response?.data?.message);
        } finally {
            updateLoader({ ASSISTANT_UPDATING: !checked });
        }
        handleFetchUserCreatedAssistants();
        handleFetchAllAssistants(1);
    };


    const handleDeletePublicAssistant = async (assistantId, record, handleUpdateAssistant, publicAssistant, setPublicAssistant) => {

        const del = await deleteSinglePublicAssistant(assistantId);

        handleUpdateAssistant(record._id, {
            is_public: false,
            is_featured : false,
        });
        const updatedAssistant = publicAssistant.filter(item => item._id !== record._id);
        setPublicAssistant(updatedAssistant);

    };
    return {
        handlePublicAssistantAdd,
        handleDeletePublicAssistant,
    };
};
