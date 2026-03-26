import { db } from "../../db/instance";
import { menu, orders, orderDetails, customOrders } from "../../config/schema";
import { inArray, eq, desc } from "drizzle-orm";

// 1. VALIDATE AND CREATE (Standard Menu Orders)
export const validateAndCreateOrder = async (userId: number, cart: any[], takeawayLocation: string) => {
  return await db.transaction(async (tx) => {
    const foodIds = cart.map((item) => item.id);
    
    const dbItems = await tx.select().from(menu).where(inArray(menu.id, foodIds));
    const unavailable = dbItems.filter(i => !i.isAvailable).map(i => i.foodName);

    if (unavailable.length > 0) {
      throw new Error(`Items currently unavailable: ${unavailable.join(", ")}`);
    }

    let total = 0;
    const detailsData: any[] = [];

    dbItems.forEach(dbItem => {
      const cartItem = cart.find(c => c.id === dbItem.id);
      const itemTotal = Number(cartItem.quantity) * Number(dbItem.price);
      total += itemTotal;

      detailsData.push({
        userId,
        menuId: dbItem.id,
        foodName: dbItem.foodName,
        quantity: cartItem.quantity,
        price: dbItem.price,
        amount: itemTotal,
      });
    });

    // Standard Order Prefix
    const orderId = `LKN-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
    
    const [newOrder] = await tx.insert(orders).values({
      id: orderId,
      userId,
      amount: total,
      takeawayLocation: takeawayLocation || "Main Canteen",
      paymentStatus: "pending",
      status: "placed"
    }).returning();

    const finalDetails = detailsData.map(d => ({ ...d, orderId: newOrder.id }));
    await tx.insert(orderDetails).values(finalDetails);

    return { orderId: newOrder.id, total: newOrder.amount };
  });
};

// 2. LINK CHECKOUT ID (Used during STK Push Trigger)
export const linkCheckoutID = async (orderId: string, checkoutID: string) => {
  // If it's a Custom Order (starts with CUST-)
  if (orderId.startsWith("CUST-")) {
    return await db.update(customOrders)
      .set({ mpesaCheckoutRequestId: checkoutID })
      .where(eq(customOrders.id, orderId));
  }
  
  // Otherwise, update standard Orders
  return await db.update(orders)
    .set({ mpesaCheckoutRequestId: checkoutID })
    .where(eq(orders.id, orderId));
};

// 3. UPDATE STATUS (Used by M-Pesa Callback)
export const updatePaymentStatus = async (checkoutID: string, status: "completed" | "failed" | "pending", receipt?: string) => {
  // A. Try updating standard orders
  const [standardUpdate] = await db.update(orders)
    .set({ 
      paymentStatus: status,
      // Use logical AND to only include if receipt exists to avoid schema issues
      ...(receipt && { mpesaReceiptNumber: receipt }) 
    })
    .where(eq(orders.mpesaCheckoutRequestId, checkoutID))
    .returning();

  if (standardUpdate) return standardUpdate;

  // B. Update Custom Orders
  const [customUpdate] = await db.update(customOrders)
    .set({ 
      paymentStatus: status,
      // For custom orders, we move status to 'placed' (active) only if paid
      status: status === "completed" ? "placed" : "cancelled",
      // IMPORTANT: Ensure customOrders table has this column in your schema.ts
      ...(receipt && { mpesaReceiptNumber: receipt }) 
    })
    .where(eq(customOrders.mpesaCheckoutRequestId, checkoutID))
    .returning();

  return customUpdate;
};

// 4. ADMIN: GET ALL PAYMENTS (Combined View)
export const getAllPaymentsService = async () => {
  const standardOrders = await db.query.orders.findMany({
    with: { user: { columns: { password: false } }, details: true },
    orderBy: [desc(orders.createdAt)]
  });

  const customPaidOrders = await db.query.customOrders.findMany({
    where: eq(customOrders.paymentStatus, "completed"),
    with: { user: { columns: { password: false } } },
    orderBy: [desc(customOrders.createdAt)]
  });

  // Merge and sort
  return [...standardOrders, ...customPaidOrders].sort((a, b) => {
    // We use "0" (the Unix Epoch) as a fallback if createdAt is null
    const timeA = new Date(a.createdAt ?? 0).getTime();
    const timeB = new Date(b.createdAt ?? 0).getTime();
    return timeB - timeA; // Descending order
  });
};

// 5. USER: GET MY HISTORY
export const getUserPaymentsService = async (userId: number) => {
  const myOrders = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { details: true },
    orderBy: [desc(orders.createdAt)]
  });

  const myCustomOrders = await db.query.customOrders.findMany({
    where: eq(customOrders.userId, userId),
    orderBy: [desc(customOrders.createdAt)]
  });

  return { orders: myOrders, customRequests: myCustomOrders };
};

export const deletePaymentService = async (orderId: string) => {
  if (orderId.startsWith("CUST-")) {
    const res = await db.delete(customOrders).where(eq(customOrders.id, orderId)).returning();
    return res.length > 0;
  }
  const result = await db.delete(orders).where(eq(orders.id, orderId)).returning();
  return result.length > 0;
};