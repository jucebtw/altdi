const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Все routes требуют авторизации и роли Admin
router.use(authMiddleware);
router.use(requireRole('Admin'));

router.get('/products', adminController.getAllProducts);
router.get('/users', adminController.getAllUsers);
router.put('/products/:id', adminController.updateProduct);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
