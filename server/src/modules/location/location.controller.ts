import { Request, Response, NextFunction } from "express";
import * as LocationService from "./location.service";

/**
 * GET /api/locations
 * Students use this to see where they can pick up food
 */
export const getLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await LocationService.getAllLocationsService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/locations
 * Admin only: Add a new pickup point
 */
export const createLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Location name is required" });
    }

    const newLoc = await LocationService.createLocationService({ name });
    res.status(201).json({ 
      success: true, 
      message: "Location added successfully", 
      data: newLoc 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/locations/:id
 * Admin only: Remove a pickup point
 */
export const deleteLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    // id is a string in req.params, but service needs a number
    const success = await LocationService.deleteLocationService(Number(id));
    
    if (!success) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }
    
    res.status(200).json({ success: true, message: "Location removed successfully" });
  } catch (error) {
    next(error);
  }
};