import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { deleteAllWebCrawledCollection, saveCrawlMarkdownAsJsonToS3, storeWebCrawlFolderInfoToDBService, storeWebCrawlInfoToDBService, syncWebCrawlKnowledgeBase, urlToFilename } from "../service/webCrawlServices.js";
import { getAllImportedWebCrawledKnowledgeBaseService } from "../service/knowledgeBase.js";
import { KnowledgeBaseMessages } from "../constants/enums.js";
import firecrawl from 'firecrawl'; 
import { createOrUpdateAppAuthService, deleteAppAuthCredentialService, getGoogleAuthCredentialService } from "../service/googleAuthService.js";
import { WebCrawlKnowledgeBaseMessages } from "../constants/enums.js";


/**
 * @async
 * @function crawlGivenUrlAndSubPages
 * @description Crawls a URL and its subpages using FireCrawl API, saves the data, and optionally syncs knowledge base.
 * @param {Object} req - Request object with body containing:
 *   - url {string} - The URL to crawl.
 *   - limit {number} - Max number of subpages to crawl (default 1).
 *   - userId {string} - User's MongoDB ObjectId.
 *   - sync {boolean} - Whether to sync the crawled data with the knowledge base (default false).
 *   - key {string|null} - Optional key (not used currently).
 * @param {Object} res - Response object returning status and data or error.
 * @returns {Response} 200 on success, 400 if crawl fails or FireCrawl not connected, 500 on server error.
 */

export const crawlGivenUrlAndSubPages = async (req, res) => {
    const { url, limit = 1 ,userId,sync = false,key = null} = req.body;
    try {
        const appName = "fireCrawl"
        const getFireCrawlKey = await getGoogleAuthCredentialService(userId,appName);
        if(getFireCrawlKey){
        const timeout = limit*2000
        const body = {
            url: url,
            limit: limit,
            scrapeOptions: {
                formats: ["markdown"]
            }
        };
        const headers = {
            headers: {
                Authorization: `Bearer ${getFireCrawlKey.accessToken}`
            }
        };

        // Start the crawl
        const crawlResponse = await axios.post(
            'https://api.firecrawl.dev/v1/crawl',
            body,
            headers
        );
        
        if (crawlResponse.data.success) {
            const crawlUrl = crawlResponse.data.url;
            let crawlData = null;
            while (true) {
                const result = await axios.get(crawlUrl, headers);
                const { status, data } = result.data;

                if (status === 'completed' && data.length > 0) {
                    crawlData = data;
                    break;
                } else if (status !== 'scraping') {
                    break;
                }
                const promiseResolve = await new Promise(resolve => setTimeout(() => resolve('Timeout reached'), timeout));
            }

            if (crawlData) {
                const storedKBIds = [];
                const webCrawlInfo = await saveCrawlMarkdownAsJsonToS3(crawlData, url, userId);
                let webCrawlCollectionCreateResult = '';
                const sortedInfo = [...webCrawlInfo].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                const webCrawlFolderInfo = sortedInfo[0];
                const webCrawlFilesInfo = sortedInfo.slice(1);


                if(webCrawlInfo){
                    const webCrawledFolderStoreInDB = await storeWebCrawlFolderInfoToDBService(webCrawlFolderInfo,userId,url);
                    const baseUrl = null;
                    const parentId = webCrawledFolderStoreInDB?._id
                    webCrawlCollectionCreateResult = await storeWebCrawlInfoToDBService(webCrawlFilesInfo,userId,baseUrl,storedKBIds,parentId);
                }
                if(sync){
                    for(const idInfo of storedKBIds){
                        const isSuccessful = await syncWebCrawlKnowledgeBase(idInfo);
                    }
                }

                return res.status(StatusCodes.OK).json({
                    data: webCrawlCollectionCreateResult,
                    message: "Successfully imported the URL"
                });
            } else {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Crawl did not complete or no data was found"
                });
            }
        } else {
           return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Failed to initiate crawl"
            });
        }
    }else{
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Please Connect FireCrawl from Connect Apps"
        });

    }
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Request failed. Check your credit score.",
            error: error.response?.data || error.message
        });
    }
};


/**
 * @async
 * @function getWebCrawledPageList
 * @description Retrieves web-crawled knowledge base data for a user by role,
 *              returning lists of imported, public, and all users' data,
 *              plus a simplified list of titles and URLs.
 * @param {Object} req - Request object with:
 *   - params.userId {string} - User's MongoDB ObjectId.
 *   - body.role {string} - User role for filtering data.
 * @param {Object} res - Response object returning status and JSON data or error.
 * @returns {Response} 200 with data on success, 400 on failure.
 */

export const getWebCrawledPageList = async (req,res)=>{
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const { importedWebCrawledData, allUsersImportedWebCrawledData, publicWebCrawledData } = await getAllImportedWebCrawledKnowledgeBaseService(role, userId);
        let webPageListWithUrlsAndTitle = [];
        for(const page of importedWebCrawledData){
            webPageListWithUrlsAndTitle.push({title : page.title,url : page.url})
        }
        for(const page of publicWebCrawledData){
            webPageListWithUrlsAndTitle.push({title : page.title,url : page.url})
        }
        return res.status(StatusCodes.OK).json({
            importedWebCrawledData, allUsersImportedWebCrawledData, publicWebCrawledData,webPageListWithUrlsAndTitle,
            message: KnowledgeBaseMessages.FILE_FETCHED_SUCCESSFULLY
        });

    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED

        });

    }
};

/**
 * @async
 * @function storeWebCrawlerCredential
 * @description Stores or updates FireCrawl credentials for a user.
 * @param {Object} req - Request object with body containing:
 *   - userId {string} - User's MongoDB ObjectId.
 *   - fireCrawlKey {string} - Credential key for FireCrawl.
 * @param {Object} res - Response object returning operation status.
 * @returns {Response} 200 on success, 400 on failure.
 */

export const storeWebCrawlerCredential = async(req,res)=>{
    const {userId,fireCrawlKey} = req.body;

    try {
        const code = fireCrawlKey;
        const accessToken = fireCrawlKey;
        const refreshToken = fireCrawlKey;
        const appName="fireCrawl";
    
        const responseOfFireCrawlKeyStore = await createOrUpdateAppAuthService(userId,code,accessToken,refreshToken,appName);
        return res.status(StatusCodes.OK).json({
            responseOfFireCrawlKeyStore,
            message: WebCrawlKnowledgeBaseMessages.ADDED_IN_FILE_LIST_SUCCESSFULLY
        });

    } catch (error) {
        console.log("error :",error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED

        });
    }
};


/**
 * @async
 * @function deleteWebCrawlerCredential
 * @description Deletes FireCrawl credentials and all related web crawled data for a user.
 * @param {Object} req - Request object with params containing:
 *   - userId {string} - User's MongoDB ObjectId.
 * @param {Object} res - Response object returning status and JSON data or error.
 * @returns {Response} 200 with deletion results on success, 400 on failure.
 */

export const deleteWebCrawlerCredential = async(req,res)=>{
    const {userId} = req.params;

    try {
        const appName="fireCrawl";
        const responseOfFireCrawlKeyDelete = await deleteAppAuthCredentialService(userId,appName);
        const deleteResponse  = await deleteAllWebCrawledCollection(userId);
        return res.status(StatusCodes.OK).json({
            responseOfFireCrawlKeyDelete,deleteResponse,
            message: WebCrawlKnowledgeBaseMessages.DELETED_SUCCESSFULLY
        });

    } catch (error) {
        console.log("error :",error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED

        });
    }
};


/**
 * @async
 * @function getWebCrawlCredential
 * @description Fetches FireCrawl credentials for a given user.
 * @param {Object} req - Request object with params containing:
 *   - userId {string} - User's MongoDB ObjectId.
 * @param {Object} res - Response object returning status and JSON data or error.
 * @returns {Response} 200 with credentials on success, 400 on failure.
 */

export const getWebCrawlCredential = async (req,res)=>{
    const {userId} = req.params;
    try {
        const appName="fireCrawl";
        const getFireCrawlCredential = userId?await getGoogleAuthCredentialService(userId,appName):null;
        return res.status(StatusCodes.OK).json({
            getFireCrawlCredential,
            message: WebCrawlKnowledgeBaseMessages.FILE_FETCHED_SUCCESSFULLY
        });

    } catch (error) {
        console.log("error :",error);
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: KnowledgeBaseMessages.ACTION_FAILED
        });
    }
};
