import { eq, or } from "drizzle-orm";
import { db } from "../../db/instance";
import { users, admins, forgotPassword } from "../../config/schema";
import bcrypt from "bcryptjs";
import { InferInsertModel } from "drizzle-orm";

type NewUser = InferInsertModel<typeof users>;

export const findAccountByCredential = async (credential: string, isAdmin: boolean = false) => {
  // If logging into Admin Portal, ONLY look in admins table
  if (isAdmin) {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, credential));
    return admin ? { ...admin, role: 'admin' } : null;
  }

  // If logging into Student Portal, look in users table by username or email
  const [user] = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.username, credential), 
        eq(users.email, credential)
      )
    );
  
  return user ? { ...user, role: 'user' } : null;
};

export const registerUserService = async (userData: NewUser) => {
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  const [newUser] = await db.insert(users).values({
    ...userData,
    password: hashedPassword,
  }).returning();
  
  return newUser;
};

export const createResetTokenService = async (username: string, resetID: string) => {
  // Clean up old tokens for this user
  await db.delete(forgotPassword).where(eq(forgotPassword.username, username));
  const [tokenRecord] = await db.insert(forgotPassword).values({ username, resetID }).returning();
  return tokenRecord;
};

export const verifyResetTokenService = async (resetID: string) => {
  const [result] = await db.select().from(forgotPassword).where(eq(forgotPassword.resetID, resetID));
  return result || null;
};

export const finalizePasswordResetService = async (username: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  
  return await db.transaction(async (tx) => {
    // Try updating users table
    const userUpdate = await tx.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, username));
    
    // If no user found, try updating admins table
    if (userUpdate.rowsAffected === 0) {
      await tx.update(admins)
        .set({ password: hashedPassword })
        .where(eq(admins.username, username));
    }

    await tx.delete(forgotPassword).where(eq(forgotPassword.username, username));
  });
};