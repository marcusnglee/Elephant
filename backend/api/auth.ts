import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService.js';

const router = Router();
const authService = AuthService.getInstance();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        error: 'Missing userId or password'
      });
    }

    const result = await authService.login(userId, password);

    if (result.success) {
      res.json({
        success: true,
        token: result.token,
        user: result.user
      });
    } else {
      res.status(401).json({
        error: result.error
      });
    }
  } catch (error) {
    console.error('Login endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Get available users (for login form)
router.get('/users', (req: Request, res: Response) => {
  try {
    const users = authService.getUsers();
    res.json({
      users: users.map(user => ({
        id: user.id,
        name: user.name
      }))
    });
  } catch (error) {
    console.error('Get users endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Verify token endpoint
router.get('/verify', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    const user = authService.verifyToken(token);
    
    if (user) {
      res.json({
        valid: true,
        user
      });
    } else {
      res.status(401).json({
        valid: false,
        error: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Verify token endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router;