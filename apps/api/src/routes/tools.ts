import { Router } from 'express';
import {
  getTools,
  getAllTools,
  getToolBySlug,
  createTool,
  updateTool,
  deleteTool,
  toggleTool,
} from '../controllers/toolController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = Router();

router.get('/', getTools);
router.get('/all', authenticateToken, requireAdmin, getAllTools);
router.get('/:slug', getToolBySlug);
router.post('/', authenticateToken, requireAdmin, createTool);
router.put('/:id', authenticateToken, requireAdmin, updateTool);
router.delete('/:id', authenticateToken, requireAdmin, deleteTool);
router.patch('/:id/toggle', authenticateToken, requireAdmin, toggleTool);

export default router;
