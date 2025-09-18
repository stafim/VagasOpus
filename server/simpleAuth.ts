import * as bcrypt from "bcrypt";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { storage } from "./storage";

const SALT_ROUNDS = 10;

// Session configuration for simple auth
export function getSessionForSimpleAuth() {
  return session({
    secret: process.env.SESSION_SECRET || 'default-dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Helper functions
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Setup simple authentication routes
export function setupSimpleAuth(app: Express) {
  // Use session middleware
  app.use(getSessionForSimpleAuth());

  // Override old Replit Auth routes to prevent conflicts
  app.get('/api/login', (req, res) => {
    res.redirect('/');
  });
  
  app.get('/api/logout', (req, res) => {
    res.redirect('/');
  });

  // Register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.format() 
        });
      }

      const { email, password, firstName, lastName } = validationResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "Email já está em uso" });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const newUser = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
      });

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = newUser;

      // Set session
      (req.session as any).user = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      };

      res.status(201).json({
        message: "Usuário criado com sucesso",
        user: userResponse,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.format() 
        });
      }

      const { email, password } = validationResult.data;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      // Set session
      (req.session as any).user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;

      res.json({
        message: "Login realizado com sucesso",
        user: userResponse,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      const user = await storage.getUser(sessionUser.id);
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });
}

// Extend session type to include user
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role?: string;
    };
  }
}