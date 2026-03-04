import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  getAllProducts,
  adminUpdateProduct,
  adminDeleteProduct,
  getAllUsers,
  deleteUser,
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and Admin role
router.use(authenticate);
router.use(requireRole('Admin'));

router.get('/products', getAllProducts);
router.put('/products/:id', adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

export default router;
