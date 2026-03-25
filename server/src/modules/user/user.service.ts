import { eq } from "drizzle-orm";
import { db } from "../../db/instance";
import { users } from "../../config/schema";
import { InferSelectModel } from "drizzle-orm";

// Type for a User (selecting)
type User = InferSelectModel<typeof users>;

/**
 * Get all users (Admin view) 
 */
export const getUsersServices = async () => {
    return await db.query.users.findMany({
        columns: {
            password: false,
        },
        with: {
            orders: true,
            customOrders: true,
        },
    });
};

/**
 * Get single user by ID with full history
 */
export const getUserByIdServices = async (userId: number) => {
    const result = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            password: false,
        },
        with: {
            orders: {
                with: {
                    details: true 
                }
            },
            customOrders: true,
        },
    });
    return result ?? null;
};

/**
 * Update user profile
 */
export const updateUserServices = async (userId: number, data: Partial<User>) => {
    const [result] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
            avatarUrl: users.avatarUrl
        });

    return result ?? null;
};

/**
 * Delete a user
 */
export const deleteUserServices = async (userId: number) => {
    const result = await db
        .delete(users)
        .where(eq(users.id, userId))
        .returning();

    return result.length > 0;
};