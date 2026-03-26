import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as UserService from "./user.service";

/**
 * GET /api/users
 * Returns combined list of Students and Admins
 */
export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // This now calls the service that merges 'users' and 'admins' tables
    const data = await UserService.getUsersServices();
    
    res.status(200).json({
      success: true,
      count: data.length, // This will now correctly show Admins + Students
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 */
export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await UserService.getUserByIdServices(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "Personnel record not found" 
      });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id
 */
export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Security check: Normalize role check for consistency
    const userRole = req.user?.role?.toLowerCase();

    if (userRole !== 'admin' && req.user?.id !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: "Access Denied: You cannot modify other personnel records" 
        });
    }

    const updatedUser = await UserService.updateUserServices(userId, req.body);
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Profile synchronized successfully", 
      data: updatedUser 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 */
export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Note: Usually, you don't want admins deleting other admins via this route
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized: Admin privileges required" });
    }

    const userId = parseInt(req.params.id);
    const success = await UserService.deleteUserServices(userId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Personnel record and associated data purged" 
    });
  } catch (error) {
    next(error);
  }
};