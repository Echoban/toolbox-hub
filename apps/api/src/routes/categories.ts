import { Router } from 'express';
import {
  getCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategory,
} from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getCategories);
router.get('/all', authenticateToken, requireAdmin, getAllCategories);
router.post('/', authenticateToken, requireAdmin, createCategory);
router.put('/:id', authenticateToken, requireAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);
router.patch('/:id/toggle', authenticateToken, requireAdmin, toggleCategory);

export default router;
