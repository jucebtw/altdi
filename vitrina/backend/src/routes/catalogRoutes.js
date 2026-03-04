const express = require('express');
const catalogController = require('../controllers/catalogController');

const router = express.Router();

router.get('/products', catalogController.getProducts);
router.get('/products/:id', catalogController.getProduct);
router.get('/categories', catalogController.getCategories);
router.get('/materials', catalogController.getMaterials);

module.exports = router;
