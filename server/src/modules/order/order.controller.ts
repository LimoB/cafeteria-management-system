import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as OrderService from "./order.service";
import { nanoid } from "nanoid"; 

// [ADMIN] Get all orders in the system
export const getOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log("Fetching all orders (Admin)...");
    const data = await OrderService.getAllOrdersService();
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getOrders controller:", error);
    next(error);
  }
};

// [STUDENT/USER] Get only the logged-in user's orders (Fixes 403 Forbidden)
export const getMyOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    console.log(`Fetching orders for User ID: ${userId}`);
    const data = await OrderService.getUserOrdersService(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getMyOrders controller:", error);
    next(error);
  }
};

// [USER] Create a new order
export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { items, takeawayLocation, locationId, amount } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const finalAmount = Number(amount);
    if (isNaN(finalAmount)) {
      return res.status(400).json({ success: false, message: "Invalid order amount" });
    }

    const orderData = {
      id: `LKN-${nanoid(6).toUpperCase()}`,
      userId: req.user.id,
      amount: finalAmount,
      locationId: Number(locationId),
      takeawayLocation,
      status: "placed" as const,
      paymentStatus: "pending" as const,
      isClosed: false,
    };

    const newOrder = await OrderService.createOrderService(orderData, items);
    
    res.status(201).json({ 
      success: true, 
      message: "Order placed successfully", 
      order: newOrder 
    });
  } catch (error) {
    console.error("Error in createOrder controller:", error);
    next(error);
  }
};

// [ADMIN] Update status
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await OrderService.updateOrderStatusService(id, status);
    
    if (!updated) return res.status(404).json({ success: false, message: "Order not found" });
    
    res.status(200).json({ 
      success: true, 
      message: `Order marked as ${status}`, 
      data: updated 
    });
  } catch (error) {
    console.error("Error in updateOrderStatus controller:", error);
    next(error);
  }
};