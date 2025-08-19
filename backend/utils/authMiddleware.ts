import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    name: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  const authService = AuthService.getInstance();
  const user = authService.verifyToken(token);

  if (!user) {
    return res.status(403).json({
      error: 'Invalid or expired token'
    });
  }

  req.user = user;
  next();
};