import { FileStorage } from '../utils/fileStorage.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  name: string;
  passwordHash: string;
}

export interface AuthData {
  users: Record<string, User>;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: Omit<User, 'passwordHash'>;
  error?: string;
}

export class AuthService {
  private static instance: AuthService;
  private authData!: AuthData;
  private readonly JWT_SECRET: string;

  private constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'elephant-local-secret-key';
    this.loadAuthData();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadAuthData(): void {
    const authPath = FileStorage.getDataPath('auth.json');
    let authData = FileStorage.readJSON<AuthData>(authPath);
    
    if (!authData) {
      // Create default users with hashed passwords
      authData = {
        users: {
          friend1: {
            id: 'friend1',
            name: 'Friend 1',
            passwordHash: bcrypt.hashSync('friend1password', 10)
          },
          friend2: {
            id: 'friend2',
            name: 'Friend 2', 
            passwordHash: bcrypt.hashSync('friend2password', 10)
          }
        }
      };
      
      FileStorage.writeJSON(authPath, authData);
    }
    
    this.authData = authData;
  }

  public async login(userId: string, password: string): Promise<LoginResult> {
    try {
      const user = this.authData.users[userId];
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid user ID'
        };
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid password'
        };
      }

      const token = jwt.sign(
        { userId: user.id, name: user.name },
        this.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  public verifyToken(token: string): { userId: string; name: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        name: decoded.name
      };
    } catch (error) {
      return null;
    }
  }

  public getUsers(): Omit<User, 'passwordHash'>[] {
    return Object.values(this.authData.users).map(user => ({
      id: user.id,
      name: user.name
    }));
  }
}