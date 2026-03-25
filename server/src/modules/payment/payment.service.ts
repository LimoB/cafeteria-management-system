import { db } from "../../db/instance";
import { menu, orders, orderDetails } from "../../config/schema";
import { inArray, eq, desc, sql } from "drizzle-orm";
import { InferInsertModel } from "drizzle-orm";

type NewOrder = InferInsertModel<typeof orders>;

export const validateAndCreateOrder = async (userId: number, cart: any[], takeawayLocation: string) => {
  return await db.transaction(async (tx) => {
    const foodIds = cart.map((item) => item.id);
    
    // 1. Fetch current prices/availability from DB
    const dbItems = await tx.select().from(menu).where(inArray(menu.id, foodIds));
    const unavailable = dbItems.filter(i => !i.isAvailable).map(i => i.foodName);

    if (unavailable.length > 0) {
      throw new Error(`Items currently unavailable: ${unavailable.join(", ")}`);
    }

    // 2. Calculate Total
    let total = 0;
    const detailsData: any[] = [];

    dbItems.forEach(dbItem => {
      const cartItem = cart.find(c => c.id === dbItem.id);
      const itemTotal = cartItem.quantity * dbItem.price;
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

    const orderId = `LKN-${Math.random().toString(36).toUpperCase().substring(2, 10)}`;
    
    // 3. Create Order Header
    const [newOrder] = await tx.insert(orders).values({
      id: orderId,
      userId,
      amount: total,
      takeawayLocation: takeawayLocation || "Main Canteen",
      paymentStatus: "pending",
      status: "placed"
    }).returning();

    // 4. Create Order Details
    const finalDetails = detailsData.map(d => ({ ...d, orderId: newOrder.id }));
    await tx.insert(orderDetails).values(finalDetails);

    return { orderId: newOrder.id, total: newOrder.amount };
  });
};

export const updatePaymentStatus = async (checkoutID: string, status: "completed" | "failed" | "pending", merchantID?: string) => {
  const [updated] = await db.update(orders)
    .set({ 
      paymentStatus: status,
      mpesaMerchantRequestId: merchantID || null 
    })
    .where(eq(orders.mpesaCheckoutRequestId, checkoutID)) // Link via CheckoutID from Callback
    .returning();
  return updated;
};

export const linkCheckoutID = async (orderId: string, checkoutID: string) => {
  return await db.update(orders)
    .set({ mpesaCheckoutRequestId: checkoutID })
    .where(eq(orders.id, orderId));
};

export const getAllPaymentsService = async () => {
  return await db.query.orders.findMany({
    with: { user: { columns: { password: false } }, details: true },
    orderBy: [desc(orders.createdAt)]
  });
};

export const getUserPaymentsService = async (userId: number) => {
  return await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { details: true },
    orderBy: [desc(orders.createdAt)]
  });
};

export const deletePaymentService = async (orderId: string) => {
  const result = await db.delete(orders).where(eq(orders.id, orderId)).returning();
  return result.length > 0;
};