import config from "../config.js";
import axios from "axios";

const syncDvDsDoc = async () => {
    try {
        const dvdsCronStatus = config.SYNC_DVDS_DOC_AUTOMATION_CRON;
        if (dvdsCronStatus && dvdsCronStatus.toLowerCase() === 'true') {
            const syncDvDsSheetUrl = config.BACKEND_API_URL + '/api/ac/sync-dvds-sheet';
            const accessKey = config.ACTIVE_COLLAB_ACCESS_KEY;

            const response = await axios.post(syncDvDsSheetUrl, {
                cronJob: true,
            }, {
                headers: {
                    'Authorization': `Bearer ${accessKey}`,
                    'Content-Type': 'application/json',
                },
            });
        }

    } catch (error) {
        return { error: error.message };
    }
}

export default syncDvDsDoc
