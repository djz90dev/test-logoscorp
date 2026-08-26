import { Router } from 'express';
import { ContactsController } from './contacts.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { syncUserSchema, syncBulkSchema } from './contacts.schema.js';

const router = Router();
const controller = new ContactsController();

router.post(
  '/sync',
  validateRequest(syncUserSchema),
  controller.syncContact
);

router.post(
  '/sync-bulk',
  validateRequest(syncBulkSchema),
  controller.syncBulk
);

export default router;
