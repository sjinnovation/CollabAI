
import express from "express";
import { createFluxImage, deleteFluxCredential, getFluxCredential, getImageBodyForDownload, storeFluxCredential } from "../controllers/fluxImageContoller.js";
const fluxImageRoute = express.Router();

fluxImageRoute.post('/create',createFluxImage);
fluxImageRoute.post('/key',storeFluxCredential);
fluxImageRoute.get('/key/:userId',getFluxCredential);
fluxImageRoute.delete('/key/:userId',deleteFluxCredential);
fluxImageRoute.get('/download',getImageBodyForDownload);








export default fluxImageRoute;