import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

/* ================================
   ENUM DEFINITIONS (TS Level)
================================== */

export const PaymentStatus = ["pending", "completed", "failed", "refunded"] as const;
export const OrderStatus = ["placed", "preparing", "ready", "collected", "cancelled"] as const;
export const ApprovalStatus = ["pending", "approved", "rejected"] as const;

/* ================================
   TABLES
================================== */

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  registerNumber: text('register_number').notNull().unique(),
  department: text('department').notNull(),
  username: text('username').notNull().unique(),
  graduationYear: integer('graduation_year').notNull(),
  password: text('password').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const admins = sqliteTable('admins', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const menu = sqliteTable('menu', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  foodName: text('food_name').notNull(),
  price: real('price').notNull(),
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  category: text('category').default('general'), 
  imageUrl: text('image_url'),
  imagePublicId: text('image_public_id'),
});

export const locations = sqliteTable('locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(), 
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(), 
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  amount: real('amount').notNull(),
  status: text('status', { enum: OrderStatus }).notNull().default('placed'),
  paymentStatus: text('payment_status', { enum: PaymentStatus }).notNull().default('pending'),
  takeawayLocation: text('takeaway_location').notNull(),
  mpesaMerchantRequestId: text('merchant_request_id'),
  mpesaCheckoutRequestId: text('checkout_request_id'),
  mpesaReceiptNumber: text("mpesa_receipt_number"),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const orderDetails = sqliteTable('order_details', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id),
  menuId: integer('menu_id').references(() => menu.id),
  foodName: text('food_name').notNull(),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  amount: real('amount').notNull(),
});

export const customOrders = sqliteTable('custom_orders', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  
  // New: Price field for Admin to set after review
  price: real('price').default(0),
  
  // Status Enums
  status: text('status', { enum: OrderStatus }).notNull().default('placed'),
  approvalStatus: text('approval_status', { enum: ApprovalStatus }).notNull().default('pending'),
  paymentStatus: text('payment_status', { enum: PaymentStatus }).notNull().default('pending'),
  
  takeawayLocation: text('takeaway_location').notNull(),
  
  // M-Pesa Tracking for Custom Orders
  mpesaMerchantRequestId: text('merchant_request_id'),
  mpesaCheckoutRequestId: text('checkout_request_id'),
  
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const forgotPassword = sqliteTable('forgot_password', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  resetID: text('reset_id').notNull().unique(),
  username: text('username').notNull().unique(),
});

/* ================================
   RELATIONS
================================== */

export const userRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  customOrders: many(customOrders),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  details: many(orderDetails),
}));

export const orderDetailRelations = relations(orderDetails, ({ one }) => ({
  order: one(orders, {
    fields: [orderDetails.orderId],
    references: [orders.id],
  }),
  menuItem: one(menu, {
    fields: [orderDetails.menuId],
    references: [menu.id],
  }),
}));

export const menuRelations = relations(menu, ({ many }) => ({
  orderDetails: many(orderDetails),
}));

export const customOrderRelations = relations(customOrders, ({ one }) => ({
  user: one(users, {
    fields: [customOrders.userId],
    references: [users.id],
  }),
}));