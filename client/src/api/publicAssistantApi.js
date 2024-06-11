import {
    GET_ALL_PUBLIC_ASSISTANT,
    ADD_PUBLIC_ASSISTANT,
    FETCH_SINGLE_USERS_ALL_PUBLIC_ASSISTANTS_DETAILS,
    GET_SINGLE_PUBLIC_ASSISTANT,
    UPDATE_SINGLE_PUBLIC_ASSISTANT,
    DELETE_SINGLE_PUBLIC_ASSISTANT,
    GET_SINGLE_USER_PROFILE_API_SLUG,
    GET_SINGLE_ASSISTANT_INFO_SLUG,
    UPDATE_ASSISTANT_PUBLIC_STATE_CHECK,
    GET_USER_PROFILE_API_SLUG
} from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";


export const getSinglePublicAssistant = async (assistantId) => {
    try {
        const response = await axiosSecureInstance.get(GET_SINGLE_PUBLIC_ASSISTANT(assistantId));
        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, message: error?.response?.data?.message };

    }

};

export const getFavoriteCount = async (assistantId) => {
    const response = await getSinglePublicAssistant(assistantId);

    var count = 0;
    if (response !== null) {
        const datas = await response.data.count;
        count = datas;
    }
    return { success: true, data: count };

};

export const fetchPublicAssistant = async (publicAssistant, setPublicAssistant,) => {
    const response = await axiosSecureInstance.get(FETCH_SINGLE_USERS_ALL_PUBLIC_ASSISTANTS_DETAILS());



    const filteredData = response.data.result;

    const promises = filteredData.map(async col => {
        try {
            const response = await axiosSecureInstance.get(GET_SINGLE_PUBLIC_ASSISTANT(col.assistant_id));

            if (response.status !== 200) {
                // If the response is not OK, throw an error
                throw new Error('Error fetching additional data');
            }

            const datas = await response.data;


            const count = datas.documentWithCount.count;


            const resp = await axiosSecureInstance.post(GET_USER_PROFILE_API_SLUG,{
                "userId" : col.userId
            });

            if (resp.status !== 200) {
                // If the response is not OK, throw an error
                throw new Error('Error fetching additional data');

            }
            const info = await resp.data;
            const userInfo = info.user.fname + " " + info.user.lname


            return { ...col, count: count, userInfo: userInfo };
        } catch (error) {
            throw new Error('Error fetching additional data :',error);
        }
    });


    Promise.all(promises)
        .then(publicAssistant => {
            // Set the state with cards and their additional data
            setPublicAssistant(publicAssistant);

        });

};
export const deleteSinglePublicAssistant = async (assistantId) => {
    try {
        const response = await axiosSecureInstance.delete(DELETE_SINGLE_PUBLIC_ASSISTANT(assistantId));
        return { success: true };


    } catch (error) {
        return { success: false, message: error?.response?.data?.message };

    }

};

export const addOrRemoveFeaturedAssistant = async (record, checked) => {
    const response = await axiosSecureInstance.patch(UPDATE_SINGLE_PUBLIC_ASSISTANT(record.assistant_id), {
        assistant_id: record.assistant_id,
        creators_id: record.userId,
        is_featured: checked
    });
    return { success: true, data: response }
};


export const fetchCards = async (cardsWithAdditionalData, setCardsWithAdditionalData, setLoading) => {
    try {
        const response = await axiosSecureInstance.get(GET_ALL_PUBLIC_ASSISTANT());

        const filteredData = response.data.publicAssistant_json_array;
        const promises = filteredData.map(async card => {
            try {
                const response = await axiosSecureInstance.get(GET_SINGLE_ASSISTANT_INFO_SLUG(card.assistant_id));
                if (response.status !== 200) {
                    // If the response is not 200, throw an error
                    throw new Error('Error fetching additional data');
                }
                const data = await response.data;

                const additionalCardData = data.assistant;
                const resp = await axiosSecureInstance.post(GET_USER_PROFILE_API_SLUG,{
                    "userId" : card.creators_id 
                });
    

                if (resp.status !== 200) {
                    // If the response is not 200, throw an error
                    throw new Error('Error fetching additional data');

                }
                const info = await resp.data;
                const userInfo = info.user

                return { ...card, additionalData: additionalCardData, userInfo: userInfo };
            } catch (error) {
                throw new Error('Error fetching additional data :',error);

            }
        });


        Promise.all(promises)
            .then(cardsWithAdditionalData => {
                // Set the state with cards and their additional data
                setCardsWithAdditionalData(cardsWithAdditionalData);
                setLoading(false);
            });


    } catch (error) {
        setLoading(false);
    };
};


export const addPublicAssistant = async (id, creatorsId, checked, assistantId) => {
    try {
        const response = await axiosSecureInstance.post(ADD_PUBLIC_ASSISTANT(), {
            assistant_id: assistantId,
            creators_id: creatorsId
        });
        if (response.status === 201 || response.status === 200) {
            return { data: response.data };
        } else {
            return { error: 'Assistant adding failed.' };
        }
    } catch (error) {
        return { error: error?.response?.data }
    };
};

export const deletePublicAssistant = async (id, creatorsId, checked, assistantId) => {
    try {
        const response = await axiosSecureInstance.delete(DELETE_SINGLE_PUBLIC_ASSISTANT(assistantId));

        if (response.status === 201 || response.status === 200) {
            return { data: response.data };
        } else {
            return { error: 'Assistant adding failed.' };
        }
    } catch (error) {
        return { error: error?.response?.data }
    };
};

export const isPublicStateChange = async (id, creatorsId, checked, assistantId) => {
    try {
        console.log("checking public flag before update :", checked)
        const resp = await axiosSecureInstance.patch(UPDATE_ASSISTANT_PUBLIC_STATE_CHECK(id), {
            is_public: checked
        }
        );
        if (resp.status === 201 || resp.status === 200) {

            return { data: resp.data };
        } else {
            return { error: 'Public flag updation failed' };
        }

    } catch (error) {
        throw new Error(error);
    }
};
