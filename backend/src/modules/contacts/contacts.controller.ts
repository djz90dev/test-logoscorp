import { Request, Response, NextFunction } from 'express';
import { ZohoAuthClient } from '../../clients/zoho.auth.client.js';
import { ZohoCRMClient } from '../../clients/zoho.crm.client.js';
import { ContactSyncService } from '../../services/contactSync.service.js';
import type { SyncUserRequest, SyncBulkRequest } from '../../shared/types.js';

export class ContactsController {
  private zohoAuthClient: ZohoAuthClient;
  private zohoCRMClient: ZohoCRMClient;
  private contactSyncService: ContactSyncService;

  constructor() {
    this.zohoAuthClient = new ZohoAuthClient();
    this.zohoCRMClient = new ZohoCRMClient();
    this.contactSyncService = new ContactSyncService(this.zohoCRMClient);
  }

  syncContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req.body as SyncUserRequest;
      const accessToken = await this.zohoAuthClient.getAccessToken();
      const result = await this.contactSyncService.syncOne(user, accessToken);

      if (result.success) {
        res.json({
          success: true,
          data: {
            contactId: result.contactId,
            operation: result.operation,
            sourceId: result.sourceId,
            message: result.operation === 'updated'
              ? 'Contact updated successfully'
              : 'Contact created successfully',
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      next(error);
    }
  };

  syncBulk = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { users } = req.body as SyncBulkRequest;
      const accessToken = await this.zohoAuthClient.getAccessToken();
      const result = await this.contactSyncService.syncBulk(users, accessToken);

      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
