import {createReview,getReviews} from '../controllers/reviewsController.js';
import express from 'express';

const router = express.Router();

router.post('/', createReview);

router.get('/', getReviews);

export default router;