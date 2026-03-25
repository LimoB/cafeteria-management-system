import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as AdminService from "./admin.service";

export const getDashboardData = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // req.admin is now type-safe thanks to AuthenticatedRequest
    const stats = await AdminService.getDashboardStatsService();
    
    res.status(200).json({ 
      success: true, 
      message: "Dashboard stats fetched successfully",
      stats 
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    next(error);
  }
};