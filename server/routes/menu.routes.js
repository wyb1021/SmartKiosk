import { Router } from 'express';
import {
  getMenus,
  getMenuById,
  updatePriority,
  createOrder,
} from '../controllers/menu.controllers.js';

const router = Router();

router.get('/', getMenus);                 // GET  /menus
router.get('/:id', getMenuById);           // GET  /menus/:id
router.patch('/:id/priority', updatePriority); // PATCH /menus/:id/priority
router.post('/orders', createOrder);

export default router;
