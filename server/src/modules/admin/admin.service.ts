import { sql, gte } from "drizzle-orm"; 
import { db } from "../../db/instance";
import { orders, users } from "../../config/schema";

// Define an interface for the stats return value
export interface DashboardStats {
  orders: number;
  users: number;
  revenue: number;
  today: number;
}

export const getDashboardStatsService = async (): Promise<DashboardStats> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await db.transaction(async (tx) => {
    // We cast the select results to any or use explicit sql template types
    const [totalOrders] = await tx.select({ count: sql<number>`count(*)` }).from(orders);
    const [totalUsers] = await tx.select({ count: sql<number>`count(*)` }).from(users);
    const [totalRevenue] = await tx.select({ sum: sql<number>`sum(amount)` }).from(orders);
    
    const [todaysOrders] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, today.toISOString()));

    return {
      orders: Number(totalOrders?.count || 0),
      users: Number(totalUsers?.count || 0),
      revenue: Number(totalRevenue?.sum || 0),
      today: Number(todaysOrders?.count || 0)
    };
  });

  return stats;
};