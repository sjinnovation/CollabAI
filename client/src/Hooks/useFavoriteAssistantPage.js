
import { addFavoriteAssistant, deleteFavoriteAssistant } from "../api/favoriteAssistant";

export const useFavoriteAssistant = () => {
    const handleDeleteFavoriteAssistant = async (assistantId, record, favoriteAssistant, setFavoriteAssistant) => {
        const resp = await deleteFavoriteAssistant(assistantId);
        const updatedCards = favoriteAssistant.filter(item => item._id !== record._id);
        setFavoriteAssistant(updatedCards);
    };
    const handleFavoriteAssistantAdd = async (assistantId, usersId) => {
        const response = await addFavoriteAssistant(assistantId, usersId);
    };
    return {
        handleDeleteFavoriteAssistant,
        handleFavoriteAssistantAdd,
    };
};