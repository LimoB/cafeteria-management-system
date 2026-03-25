import { eq, desc } from "drizzle-orm";
import { db } from "../../db/instance";
import { customOrders } from "../../config/schema";
import { InferInsertModel } from "drizzle-orm";

type NewCustomOrder = InferInsertModel<typeof customOrders>;

// Fetch all custom orders (Admin view) with user details
export const getAllCustomOrdersService = async () => {
  return await db.query.customOrders.findMany({
    with: { 
      user: { 
        columns: { password: false } 
      } 
    },
    orderBy: [desc(customOrders.createdAt)]
  });
};

// Fetch specific user's custom orders
export const getCustomOrdersByUserService = async (userId: number) => {
  return await db.query.customOrders.findMany({
    where: eq(customOrders.userId, userId),
    orderBy: [desc(customOrders.createdAt)]
  });
};

// Create a custom request
export const createCustomOrderService = async (data: NewCustomOrder) => {
  const [result] = await db.insert(customOrders).values(data).returning();
  return result;
};

// Update order (Admin can change status/approvalStatus)
export const updateCustomOrderService = async (id: string, data: Partial<NewCustomOrder>) => {
  const [result] = await db
    .update(customOrders)
    .set(data)
    .where(eq(customOrders.id, id))
    .returning();
  return result || null;
};

// Delete a custom request
export const deleteCustomOrderService = async (id: string) => {
  const result = await db.delete(customOrders).where(eq(customOrders.id, id)).returning();
  return result.length > 0;
};