import { crawlGivenUrlAndSubPages, deleteWebCrawlerCredential, getWebCrawlCredential, getWebCrawledPageList, storeWebCrawlerCredential } from '../controllers/webCrawlController.js';
import authenticateUser from '../middlewares/login.js';
import express from 'express';

const webCrawlRouter = express.Router();
webCrawlRouter.post('/key',storeWebCrawlerCredential);
webCrawlRouter.post('/crawl',crawlGivenUrlAndSubPages);
webCrawlRouter.get('/crawl/:userId',getWebCrawledPageList);
webCrawlRouter.get('/key/:userId',getWebCrawlCredential);
webCrawlRouter.delete('/key/:userId',deleteWebCrawlerCredential);




export default webCrawlRouter;
