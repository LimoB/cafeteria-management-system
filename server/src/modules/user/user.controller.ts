import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as UserService from "./user.service";

export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const data = await UserService.getUsersServices();
    
    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await UserService.getUserByIdServices(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Security check: Students should only be able to update their OWN profile
    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden: You can only update your own profile" });
    }

    const updatedUser = await UserService.updateUserServices(userId, req.body);
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "User updated successfully", 
      data: updatedUser 
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.params.id);
    const success = await UserService.deleteUserServices(userId);
    
    if (!success) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "User and associated records deleted successfully" 
    });
  } catch (error) {
    next(error);
  }
};