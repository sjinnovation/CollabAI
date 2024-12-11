import express from 'express';
import {  getAllRevenueData } from '../controllers/revenueController.js';
import authenticateUser from "../middlewares/login.js";

const revenuerouter = express.Router();

revenuerouter.get('/', authenticateUser, getAllRevenueData);


export default revenuerouter;
