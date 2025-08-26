import { getUserID } from "../Utility/service";
import { WEB_CRAWLED_PAGES, WEB_CRAWLER_KEY_SLUG, WEB_CRAWLER_USER_BASED_KEY_SLUG } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";

const userId = getUserID();

export const getWebCrawledPages = async ()=>{
    const webPageList = await axiosSecureInstance.get(WEB_CRAWLED_PAGES(userId));
    return webPageList.data.webPageListWithUrlsAndTitle !==null ? webPageList?.data?.webPageListWithUrlsAndTitle : '';
}
export const storeFireCrawlKeyToDB = async (fireCrawlKey)=>{
    const body = {
        userId : userId,
        fireCrawlKey : fireCrawlKey
    }
    const responseOfFireCrawlKeyStore = await axiosSecureInstance.post(WEB_CRAWLER_KEY_SLUG,body);
    return responseOfFireCrawlKeyStore;
};

export const deleteFireCrawlKeyFromDB = async ()=>{
    const responseOfFireCrawlKeyDelete = await axiosSecureInstance.delete(WEB_CRAWLER_USER_BASED_KEY_SLUG(userId));
    return responseOfFireCrawlKeyDelete;
};
export const getWebCrawlerCredentials = async (setIsWebCrawlConnected)=>{
    const webCrawlerCredential = userId?await axiosSecureInstance.get(WEB_CRAWLER_USER_BASED_KEY_SLUG(userId)):null;
    if(webCrawlerCredential?.data?.getFireCrawlCredential?.accessToken){
        setIsWebCrawlConnected(true);
    }else{
        setIsWebCrawlConnected(false);
    }
    return webCrawlerCredential
};
export const createWebCrawledPages = async ()=>{
    const webPageList = await axiosSecureInstance.get(WEB_CRAWLED_PAGES(userId));
    return webPageList.data.webPageListWithUrlsAndTitle !==null ? webPageList?.data?.webPageListWithUrlsAndTitle : '';
}