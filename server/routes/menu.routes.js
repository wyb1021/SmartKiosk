import { Router } from 'express';
import { getMenus, getMenuById } from '../controllers/menu.controllers.js';

const router = Router();

router.get('/', getMenus);        //  GET /api/menu
router.get('/:id', getMenuById);  //  GET /api/menu/:id

export default router;
