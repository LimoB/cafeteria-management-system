import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as CustomOrderService from "./customOrder.service";
import { nanoid } from "nanoid";

export const getCustomOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await CustomOrderService.getAllCustomOrdersService();
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const createCustomOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { description, takeawayLocation } = req.body;
    
    // Ensure req.user exists (from userAuth middleware)
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const newOrder = await CustomOrderService.createCustomOrderService({
      id: `CUST-${nanoid(6).toUpperCase()}`,
      userId: req.user.id,
      description,
      takeawayLocation,
      status: "placed",          // Matches our new OrderStatus enum
      approvalStatus: "pending", // Matches our new ApprovalStatus enum
      isClosed: false,
    });
    
    res.status(201).json({ 
      success: true, 
      message: "Custom request submitted successfully", 
      data: newOrder 
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updated = await CustomOrderService.updateCustomOrderService(id, req.body);
    
    if (!updated) return res.status(404).json({ success: false, message: "Order not found" });
    
    res.status(200).json({ 
      success: true, 
      message: "Custom order updated", 
      data: updated 
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const success = await CustomOrderService.deleteCustomOrderService(req.params.id);
    
    if (!success) return res.status(404).json({ success: false, message: "Order not found" });
    
    res.status(200).json({ success: true, message: "Custom request deleted" });
  } catch (error) {
    next(error);
  }
};