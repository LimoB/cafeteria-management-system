import { eq, desc, inArray } from "drizzle-orm";
import { db } from "../../db/instance"; 
import { orders, orderDetails, menu } from "../../config/schema";
import { InferInsertModel } from "drizzle-orm";

type NewOrder = InferInsertModel<typeof orders>;
type NewOrderDetail = InferInsertModel<typeof orderDetails>;

// Admin View: Get every order in the system
export const getAllOrdersService = async () => {
  return await db.query.orders.findMany({
    with: {
      user: {
        columns: { password: false }
      },
      details: true,
    },
    orderBy: [desc(orders.createdAt)],
  });
};

// Student View: Get only orders belonging to a specific user
export const getUserOrdersService = async (userId: number) => {
  return await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: {
      details: true,
    },
    orderBy: [desc(orders.createdAt)],
  });
};

/**
 * Atomic Transaction: Create Order + Order Details
 */
export const createOrderService = async (orderData: NewOrder, items: any[]) => {
  return await db.transaction(async (tx) => {
    console.log("--- Starting DB Transaction ---");

    // 1. Insert main order
    const [newOrder] = await tx.insert(orders).values(orderData).returning();

    // 2. Fetch Menu items to get real-time price/name (Source of Truth)
    const menuItemIds = items.map((i) => i.menuItemId);
    const officialMenuItems = await tx
      .select()
      .from(menu)
      .where(inArray(menu.id, menuItemIds));

    // 3. Map items securely
    const detailedItems: NewOrderDetail[] = items.map((item) => {
      const dbItem = officialMenuItems.find((m) => m.id === item.menuItemId);
      
      if (!dbItem) {
        throw new Error(`Menu item with ID ${item.menuItemId} not found`);
      }

      const itemPrice = Number(dbItem.price);
      const itemQuantity = Number(item.quantity);
      const totalLineAmount = itemPrice * itemQuantity;

      return {
        orderId: newOrder.id,
        userId: Number(newOrder.userId), // Explicit cast to match schema types
        menuId: dbItem.id,
        foodName: dbItem.foodName,
        quantity: itemQuantity,
        price: itemPrice,
        amount: totalLineAmount,
      };
    });

    // 4. Batch insert into orderDetails
    if (detailedItems.length > 0) {
      await tx.insert(orderDetails).values(detailedItems);
    }

    console.log(`--- Transaction Successful: Order ${newOrder.id} ---`);
    return newOrder;
  });
};

/**
 * Update Order Status
 * Uses a literal type or your Enum for status safety
 */
export const updateOrderStatusService = async (
  orderId: string, 
  status: 'placed' | 'preparing' | 'ready' | 'collected' | 'cancelled'
) => {
  const [result] = await db.update(orders)
    .set({ status })
    .where(eq(orders.id, orderId))
    .returning();
    
  return result || null;
};