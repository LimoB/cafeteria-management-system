import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as CustomOrderService from "./customOrder.service";
import { nanoid } from "nanoid";

// 1. Fetch Orders: Admin gets all, User gets only their own
export const getCustomOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    let orders;
    if (req.user.role === "admin") {
      orders = await CustomOrderService.getAllCustomOrdersService();
    } else {
      orders = await CustomOrderService.getCustomOrdersByUserService(req.user.id);
    }

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// 2. Create Order: Defaults to 0 price and pending payment
export const createCustomOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { description, takeawayLocation } = req.body;
    
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const newOrder = await CustomOrderService.createCustomOrderService({
      id: `CUST-${nanoid(6).toUpperCase()}`,
      userId: req.user.id,
      description,
      takeawayLocation,
      price: 0, // Initial price is 0 until Admin quotes
      status: "placed",
      approvalStatus: "pending",
      paymentStatus: "pending",
    });
    
    res.status(201).json({ 
      success: true, 
      message: "Custom request submitted! Please wait for a price quote.", 
      data: newOrder 
    });
  } catch (error) {
    next(error);
  }
};

// 3. Update Order: This is where Admin sets the Price and Approval
export const updateCustomOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const existingOrder = await CustomOrderService.getCustomOrderById(id);
    if (!existingOrder) return res.status(404).json({ success: false, message: "Order not found" });

    // --- SECURITY CHECKS ---
    
    // 1. Ownership Check
    if (req.user.role !== "admin" && existingOrder.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: Access Denied" });
    }

    // 2. Prevent users from updating fields they shouldn't touch
    if (req.user.role !== "admin") {
       // If user is trying to change price or approvalStatus, block it
       if (updateData.price || updateData.approvalStatus || updateData.paymentStatus) {
          return res.status(403).json({ success: false, message: "Only admins can update price or status" });
       }
       // Prevent modification if already reviewed
       if (existingOrder.approvalStatus !== "pending") {
          return res.status(400).json({ success: false, message: "Cannot modify an order already in review" });
       }
    }

    // 3. Prevent Admin from changing price AFTER it's paid
    if (existingOrder.paymentStatus === 'completed' && updateData.price) {
        return res.status(400).json({ success: false, message: "Cannot change price of a paid order" });
    }

    const updated = await CustomOrderService.updateCustomOrderService(id, updateData);
    
    res.status(200).json({ 
      success: true, 
      message: "Custom order updated successfully", 
      data: updated 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Pay Custom Order Validation
 * This acts as a 'pre-flight' check before the Frontend triggers the actual M-Pesa STK Push
 */
export const payCustomOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const order = await CustomOrderService.getCustomOrderById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Validate State
    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only pay for your own orders" });
    }

    if (order.approvalStatus !== 'approved' || !order.price || order.price <= 0) {
      return res.status(400).json({ success: false, message: "This order is not ready for payment (No price quote found)" });
    }

    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: "Order is already paid" });
    }

    res.status(200).json({ 
      success: true, 
      data: {
        orderId: order.id,
        amount: order.price,
        phone: req.user.phone 
      } 
    });
  } catch (error) {
    next(error);
  }
};

// 5. Delete Order
export const deleteCustomOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const existingOrder = await CustomOrderService.getCustomOrderById(id);
    if (!existingOrder) return res.status(404).json({ success: false, message: "Order not found" });

    // Security check
    if (req.user.role !== "admin" && existingOrder.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    await CustomOrderService.deleteCustomOrderService(id);
    res.status(200).json({ success: true, message: "Custom request removed" });
  } catch (error) {
    next(error);
  }
};