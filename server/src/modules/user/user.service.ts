import { eq } from "drizzle-orm";
import { db } from "../../db/instance";
import { users, admins } from "../../config/schema"; // Import both tables
import { InferSelectModel } from "drizzle-orm";

/**
 * Get all personnel (Combines Users and Admins for the Directory)
 */
export const getUsersServices = async () => {
    // 1. Fetch Students (Users)
    const allStudents = await db.query.users.findMany({
        columns: {
            password: false,
        },
        with: {
            orders: true,
            customOrders: true,
        },
    });

    // 2. Fetch System Admins
    const allAdmins = await db.query.admins.findMany({
        columns: {
            password: false,
        }
    });

    // 3. Normalize and Combine
    // We manually map the 'role' so the frontend can differentiate them
    const formattedStudents = allStudents.map(student => ({
        ...student,
        role: 'student' as const
    }));

    const formattedAdmins = allAdmins.map(admin => ({
        ...admin,
        role: 'admin' as const,
        // Admins don't have these fields in your schema, so we provide defaults
        email: `${admin.username}@system.os`, 
        registerNumber: 'SYS-ADMIN',
        department: 'Information Systems',
        phone: 'N/A'
    }));

    return [...formattedAdmins, ...formattedStudents];
};

/**
 * Get single user by ID (Student logic)
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
    return result ? { ...result, role: 'student' } : null;
};

/**
 * Update user profile (Student logic)
 */
export const updateUserServices = async (userId: number, data: any) => {
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
 * Delete a user (Student logic)
 */
export const deleteUserServices = async (userId: number) => {
    const result = await db
        .delete(users)
        .where(eq(users.id, userId))
        .returning();

    return result.length > 0;
};