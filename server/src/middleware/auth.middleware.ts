import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the payload structure
interface JWTPayload {
  id: number;
  username: string;
  role: 'user' | 'admin';
  name?: string;
}

/**
 * Extend Express Request to include user and admin properties
 * This prevents the "Property does not exist on type Request" error
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  admin?: JWTPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || "canteen_secret_2026";

export const userAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies["token"] || req.cookies["user-token"];

  if (!token) {
    return res.status(401).json({ success: false, message: "Session expired. Please sign in." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (!decoded || (decoded.role !== "user" && decoded.role !== "admin")) {
        throw new Error("Invalid role or payload");
    }

    req.user = decoded;

    if (req.path === "/auth-check") {
      return res.status(200).json({
        success: true,
        message: "Student authorized",
        user: { id: decoded.id, username: decoded.username, name: decoded.name || decoded.username }
      });
    }

    next();
  } catch (error: any) {
    res.clearCookie("token");
    return res.status(401).json({ success: false, message: "Invalid session." });
  }
};

export const adminAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies["token"] || req.cookies["admin-token"];

  if (!token) {
    return res.status(403).json({ success: false, message: "Access Denied: Admin required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (decoded.role !== "admin") {
        return res.status(403).json({ success: false, message: "Unauthorized: Admin access only." });
    }

    req.admin = decoded;

    if (req.path === "/auth-check") {
      return res.status(200).json({
        success: true,
        message: "Admin authorized",
        admin: { id: decoded.id, username: decoded.username, name: decoded.name }
      });
    }

    next();
  } catch (error: any) {
    return res.status(403).json({ success: false, message: "Session expired or invalid." });
  }
};
