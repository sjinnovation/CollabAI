import { deleteSinglePublicAssistant, getFavoriteCount } from "../api/publicAssistantApi";
import {
    Button,
    Space,
    Table,
    Tag,
    Modal,
    Tooltip,
    Switch,
    message
} from "antd";
import { addOrRemoveFeaturedAssistant } from "../api/publicAssistantApi";
import { AssistantAddedToFeaturedList, AssistantRemovedFromFeaturedList } from "../constants/PublicAndPrivateAssistantMessages";
import { deletePinnedAssistant } from "../api/pinnedAssistant";
import { getUserID } from "./service";
const { confirm } = Modal;
const userId = getUserID();

export const handleSwitchChange = async (record, checked, handleUpdateAssistant,fromOrganizationalPage = false) => {

    if (checked == false && record?.is_public == true) {
        const resp = await getFavoriteCount(record?.assistant_id);
        const count = resp.data;

        confirm({
            title: (count > 0) ? `Are you sure you want to deactivate this Assistant? ${count} users are using this assistant ` : 'Are you sure you want to deactivate this Assistant?',
            content: `You are deactivating ${record.name}.`,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            async onOk() {
                try {
                   const updateAssistantResponse =  await handleUpdateAssistant(record, {
                        is_active: checked,
                        is_public: false,
                        is_featured: false
                    });

                    const responseOfPublicAssistantDeleteAPI = await deleteSinglePublicAssistant(record?.assistant_id);
                    const fromModal = true;
                    const responseOfPinnedAssistantDeleteAPI = await deletePinnedAssistant(record?.assistant_id, record?._id, userId, false, fromOrganizationalPage,fromModal);
                } catch (error) {
                    console.error('Error in deactivation:', error);
                } finally {
                    Modal.destroyAll();
                }
            }
            ,
            onCancel() {
                console.log('Cancel');
            },
        });




    } else {
        const fromModal = true;
        await handleUpdateAssistant(record, {
            is_active: checked,
        });
        if (checked === false) {
            const responseOfPinnedAssistantDeleteAPI = await deletePinnedAssistant(record?.assistant_id, record?._id, userId, false,fromOrganizationalPage,fromModal);
        }

    }

};


export const showDeleteConfirm = async (assistantId, assistantName, handleDeleteAssistant) => {
    const url = process.env.REACT_APP_BASE_URL
    const resp = await getFavoriteCount(assistantId);
    const count = resp.data;

    confirm({
        title: (count > 0) ? `Are you sure you want to delete this assistant ? ${count} users are using this assistant ` : 'Are you sure you want to delete this Assistant?',
        content: `You are deleting ${assistantName}.`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
            handleDeleteAssistant(assistantId);
        },
        onCancel() {
            console.log('Cancel');
        },
    });
};
export const showDeletePublicConfirm = async (record, handleDeletePublicAssistant, handleUpdateAssistant, publicAssistant, setPublicAssistant) => {

    const url = process.env.REACT_APP_BASE_URL
    const response = await getFavoriteCount(record?.assistant_id);
    const count = response.data;

    confirm({
        title: (count > 0) ? `Are you sure you want to delete this assistant ? ${count} users are using this assistant ` : 'Are you sure you want to delete this Assistant?',
        content: `You are deleting ${record?.name}.`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
       async onOk() {
            await handleDeletePublicAssistant(record?.assistant_id, record, handleUpdateAssistant, publicAssistant, setPublicAssistant);
        },
        onCancel() {
            console.log('Cancel');

        },
    });
};

export const showRemoveConfirm = async (assistantId, assistantName, _id, data, checked, is_active, handlePublicAssistantAdd) => {
    const resp = await getFavoriteCount(assistantId);
    const count = (resp.data) ? resp.data : 0;

    confirm({
        title: (count > 0) ? `Are you sure you want to make this Assistant private? ${count} users are using this Assistant ` : 'Are you sure you want to make this Assistant private?',
        content: `You are making ${assistantName} private.`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
            handlePublicAssistantAdd(_id, data, checked, assistantId, is_active);
        },
        onCancel() {
            console.log('Cancel');
        },
    });
};



export const showDeleteFavConfirm = (record, handleDeleteFavoriteAssistant, favoriteAssistant, setFavoriteAssistant) => {
    confirm({
        title: 'Are you sure, You want to remove this Assistant from favorite?',
        content: `You are removing ${record?.name}.`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk() {
            handleDeleteFavoriteAssistant(record?.assistant_id, record, favoriteAssistant, setFavoriteAssistant);
        },
        onCancel() {
            console.log('Cancel');
        },
    });
};


const handleUpdateAssistantWrapper = async (record, data, originalHandleUpdateAssistant) => {
    const originalMessageSuccess = message.success;
    message.success = () => { };

    try {
        await originalHandleUpdateAssistant(record, data);
    } finally {
        message.success = originalMessageSuccess;
    }
};

export const handleCheckboxChange = async (record, checked, publicAssistant, setPublicAssistant, handleUpdateAssistant) => {
    // Handle checkbox change

    const response = await addOrRemoveFeaturedAssistant(record, checked);

    if (response.data.status == 200 || response.data.status == 201) {
        if (checked == true) {
            message.success(AssistantAddedToFeaturedList);
        } else {
            message.success(AssistantRemovedFromFeaturedList);
        }
        await handleUpdateAssistantWrapper(record, { is_featured: checked }, handleUpdateAssistant);

        const updatedAssist = publicAssistant.map(assist => {

            if (assist && assist?._id === record?._id ) {
                return { ...assist, is_featured: checked };
            }
            return assist;
        });
        setPublicAssistant(updatedAssist);
    }

};