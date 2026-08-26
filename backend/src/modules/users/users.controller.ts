import { Request, Response, NextFunction } from 'express';
import { JSONPlaceholderClient } from '../../clients/jsonplaceholder.client.js';
import { normalizeUsers } from '../../services/normalization.js';

export class UsersController {
  private client: JSONPlaceholderClient;

  constructor() {
    this.client = new JSONPlaceholderClient();
  }

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.client.getUsers();
      const normalized = normalizeUsers(users);
      res.json({ data: normalized });
    } catch (error) {
      next(error);
    }
  };
}
