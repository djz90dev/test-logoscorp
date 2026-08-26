import { Router } from 'express';
import { UsersController } from './users.controller.js';

const router = Router();
const controller = new UsersController();

router.get('/', controller.getUsers);

export default router;
