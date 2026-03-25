import { eq } from "drizzle-orm";
import { db } from "../../db/instance";
import { locations } from "../../config/schema";
import { InferInsertModel } from "drizzle-orm";

type NewLocation = InferInsertModel<typeof locations>;

// Fetch all available pickup locations
export const getAllLocationsService = async () => {
  return await db.select().from(locations);
};

// Create a new location (Admin only)
export const createLocationService = async (data: NewLocation) => {
  const [result] = await db.insert(locations).values(data).returning();
  return result; 
};

// Delete a location (Admin only)
export const deleteLocationService = async (id: number) => {
  const result = await db.delete(locations).where(eq(locations.id, id)).returning();
  return result.length > 0;
};