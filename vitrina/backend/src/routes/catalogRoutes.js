import express from 'express';
import { getProducts, getProduct } from '../controllers/catalogController.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:id', getProduct);

export default router;
