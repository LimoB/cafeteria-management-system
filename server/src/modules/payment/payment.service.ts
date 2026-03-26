import { db } from "../../db/instance";
import { menu, orders, orderDetails, customOrders, users } from "../../config/schema";
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
      const itemQuantity = Number(cartItem.quantity);
      const itemPrice = Number(dbItem.price);
      const itemTotal = itemQuantity * itemPrice;
      total += itemTotal;

      detailsData.push({
        userId,
        menuId: dbItem.id,
        foodName: dbItem.foodName,
        quantity: itemQuantity,
        price: itemPrice, // SQLite 'real' takes numbers
        amount: itemTotal, // SQLite 'real' takes numbers
      });
    });

    // Standard Order Prefix
    const orderId = `LKN-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
    
    const [newOrder] = await tx.insert(orders).values({
      id: orderId,
      userId,
      amount: total, // Passing as number for SQLite 'real'
      takeawayLocation: takeawayLocation || "Main Canteen",
      paymentStatus: "pending",
      status: "placed"
    }).returning();

    const finalDetails = detailsData.map(d => ({ ...d, orderId: newOrder.id }));
    await tx.insert(orderDetails).values(finalDetails);

    return { orderId: newOrder.id, total: newOrder.amount };
  });
};

// 2. LINK CHECKOUT ID (Standardized for both tables)
export const linkCheckoutID = async (orderId: string, checkoutID: string) => {
  if (orderId.startsWith("CUST-")) {
    return await db.update(customOrders)
      .set({ mpesaCheckoutRequestId: checkoutID })
      .where(eq(customOrders.id, orderId));
  }
  
  return await db.update(orders)
    .set({ mpesaCheckoutRequestId: checkoutID })
    .where(eq(orders.id, orderId));
};

// 3. UPDATE STATUS (Used by M-Pesa Callback)
export const updatePaymentStatus = async (checkoutID: string, status: "completed" | "failed" | "pending", receipt?: string) => {
  // Try standard orders first
  const [standardUpdate] = await db.update(orders)
    .set({ 
      paymentStatus: status,
      ...(receipt && { mpesaReceiptNumber: receipt }) 
    })
    .where(eq(orders.mpesaCheckoutRequestId, checkoutID))
    .returning();

  if (standardUpdate) return standardUpdate;

  // Otherwise update custom orders
  const [customUpdate] = await db.update(customOrders)
    .set({ 
      paymentStatus: status,
      status: status === "completed" ? "placed" : "cancelled",
      ...(receipt && { mpesaReceiptNumber: receipt }) 
    })
    .where(eq(customOrders.mpesaCheckoutRequestId, checkoutID))
    .returning();

  return customUpdate;
};

// 4. ADMIN: GET ALL PAYMENTS (Flattened & Sorted)
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

  return [...standardOrders, ...customPaidOrders].sort((a, b) => {
    const timeA = new Date(a.createdAt ?? 0).getTime();
    const timeB = new Date(b.createdAt ?? 0).getTime();
    return timeB - timeA;
  });
};

// 5. USER: GET MY HISTORY (Flat list for Frontend consistency)
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

  // Flattening into one array so paymentSlice.ts doesn't crash
  return [...myOrders, ...myCustomOrders].sort((a, b) => {
    const timeA = new Date(a.createdAt ?? 0).getTime();
    const timeB = new Date(b.createdAt ?? 0).getTime();
    return timeB - timeA;
  });
};

// 6. DELETE PAYMENT
export const deletePaymentService = async (orderId: string) => {
  if (orderId.startsWith("CUST-")) {
    const res = await db.delete(customOrders).where(eq(customOrders.id, orderId)).returning();
    return res.length > 0;
  }
  const result = await db.delete(orders).where(eq(orders.id, orderId)).returning();
  return result.length > 0;
};

// 7. USER LOOKUP (Resolves the 'User 4' 500 error)
export const findUserById = async (userId: string | number) => {
  const id = typeof userId === 'string' ? parseInt(userId) : userId;
  
  if (isNaN(id)) return null;

  const result = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    phone: users.phone, // Matches your 'phone' column in schema
    registerNumber: users.registerNumber,
    department: users.department
  })
  .from(users)
  .where(eq(users.id, id))
  .limit(1);

  return result[0] || null;
};