import { Request, Response, NextFunction } from "express";
import * as AuthService from "./auth.service";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const JWT_SECRET = process.env.JWT_SECRET || "canteen_secret_2026";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await AuthService.registerUserService(req.body);
    res.status(201).json({ 
      success: true, 
      message: "Registration successful!", 
      data: { id: newUser.id, username: newUser.username } 
    });
  } catch (error: any) {
    if (error.message?.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ success: false, message: "Username, Email, or Reg Number already exists" });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, isAdmin } = req.body;
    
    // Explicitly cast isAdmin to boolean (handles string "true" from some clients)
    const isServiceAdmin = isAdmin === true || isAdmin === 'true';

    const account = await AuthService.findAccountByCredential(username, isServiceAdmin);

    // If account not found in the specific table, or password mismatch
    if (!account || !(await bcrypt.compare(password, account.password))) {
      return res.status(401).json({ 
        success: false, 
        message: isServiceAdmin ? "Invalid Admin credentials" : "Invalid Student credentials" 
      });
    }

    const role = isServiceAdmin ? "admin" : "user";

    const token = jwt.sign(
      { id: account.id, username: account.username, role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      maxAge: 24 * 60 * 60 * 1000 
    }).json({ 
      success: true, 
      role, // Return 'admin' or 'user' based on which login portal was used
      user: { 
        id: account.id, 
        name: account.name || account.username,
        username: account.username 
      }
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.body;
    // Check both potential tables by trying admin then user
    const user = await AuthService.findAccountByCredential(username, true) || 
                 await AuthService.findAccountByCredential(username, false);

    if (!user) return res.status(404).json({ success: false, message: "Account not found" });

    const resetID = nanoid(32);
    await AuthService.createResetTokenService(username, resetID);
    
    // Log the link (useful for development in Kali)
    console.log(`🔗 RESET LINK: http://localhost:5174/auth/reset-password/${resetID}`);
    
    res.json({ success: true, message: "Reset token generated. Check terminal logs." });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetID, newPassword } = req.body;
    const resetEntry = await AuthService.verifyResetTokenService(resetID);
    
    if (!resetEntry) return res.status(400).json({ success: false, message: "Invalid or expired token" });

    await AuthService.finalizePasswordResetService(resetEntry.username, newPassword);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("token").json({ success: true, message: "Logged out successfully" });
};