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
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const existingOrder = await CustomOrderService.getCustomOrderById(id);
    if (!existingOrder) return res.status(404).json({ success: false, message: "Order not found" });

    // SECURITY: Users can only update their own (e.g., changing description before approval)
    // Admins can update anything (e.g., setting the price or approval status)
    if (req.user.role !== "admin" && existingOrder.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: Access Denied" });
    }

    // If a user is trying to update their own order AFTER it's been approved, block them
    if (req.user.role !== "admin" && existingOrder.approvalStatus !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot modify an order already in review" });
    }

    const updated = await CustomOrderService.updateCustomOrderService(id, req.body);
    
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
 * 4. Pay Custom Order: 
 * Validates the order and ensures it's ready for M-Pesa.
 * The actual STK push is handled by triggerStkPush in PaymentController.
 */
export const payCustomOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const order = await CustomOrderService.getCustomOrderById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // 1. Ownership Check
    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only pay for your own orders" });
    }

    // 2. State Check: Must be approved by Admin AND have a price
    if (order.approvalStatus !== 'approved') {
      return res.status(400).json({ success: false, message: "Order is not yet approved by the Canteen Admin" });
    }

    if (!order.price || order.price <= 0) {
      return res.status(400).json({ success: false, message: "No price has been quoted for this request yet" });
    }

    // 3. Payment Status Check: Don't allow double payment
    if (order.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: "This order is already paid for" });
    }

    // SUCCESS: Return the order details. 
    // The Frontend will now take this 'price' and 'id' and call /api/payments/stkpush
    res.status(200).json({ 
      success: true, 
      message: "Order validated. Proceed to M-Pesa payment.", 
      data: {
        orderId: order.id,
        amount: order.price,
        phoneNumber: req.user.phone // Suggesting the phone number to use
      } 
    });
  } catch (error) {
    next(error);
  }
};

// 4. Delete Order: Admin or Owner
export const deleteCustomOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const existingOrder = await CustomOrderService.getCustomOrderById(id);
    if (!existingOrder) return res.status(404).json({ success: false, message: "Order not found" });

    if (req.user.role !== "admin" && existingOrder.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Forbidden: Access Denied" });
    }

    await CustomOrderService.deleteCustomOrderService(id);
    
    res.status(200).json({ success: true, message: "Custom request removed" });
  } catch (error) {
    next(error);
  }
};