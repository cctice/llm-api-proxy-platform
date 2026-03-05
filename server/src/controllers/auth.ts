import { Request, Response } from 'express';
import { AuthService } from '../services/auth';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, name } = req.body;

    const result = await AuthService.register(email, password, name);

    res.json(successResponse(result, 'User registered successfully'));
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    res.json(successResponse(result, 'Login successful'));
  }

  static async getProfile(req: AuthRequest, res: Response) {
    const userId = req.user!.id;

    const user = await AuthService.getUser(userId);

    res.json(successResponse(user));
  }
}
