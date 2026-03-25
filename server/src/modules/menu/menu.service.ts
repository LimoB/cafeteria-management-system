import { eq, asc } from "drizzle-orm";
import { db } from "../../db/instance";
import { menu } from "../../config/schema";
import { InferInsertModel } from "drizzle-orm";

type NewMenuItem = InferInsertModel<typeof menu>;

export const getMenuItemsService = async () => {
  return await db.select().from(menu).orderBy(asc(menu.foodName));
};

export const getMenuItemByIdService = async (id: number) => {
  return await db.query.menu.findFirst({
    where: eq(menu.id, id),
    // Using the relation name defined in schema.ts
    with: {
      orderDetails: true 
    }
  });
};

export const createMenuItemService = async (data: NewMenuItem) => {
  const [result] = await db.insert(menu).values(data).returning();
  return result;
};

export const updateMenuItemService = async (id: number, data: Partial<NewMenuItem>) => {
  const [result] = await db.update(menu)
    .set(data)
    .where(eq(menu.id, id))
    .returning();
  return result || null;
};

export const deleteMenuItemService = async (id: number) => {
  const result = await db.delete(menu).where(eq(menu.id, id)).returning();
  return result.length > 0;
};