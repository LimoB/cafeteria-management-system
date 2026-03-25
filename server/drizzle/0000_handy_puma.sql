CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE TABLE `custom_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	`description` text NOT NULL,
	`status` text DEFAULT 'placed' NOT NULL,
	`approval_status` text DEFAULT 'pending' NOT NULL,
	`takeaway_location` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `forgot_password` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reset_id` text NOT NULL,
	`username` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `forgot_password_reset_id_unique` ON `forgot_password` (`reset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `forgot_password_username_unique` ON `forgot_password` (`username`);--> statement-breakpoint
CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `menu` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`food_name` text NOT NULL,
	`price` real NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`category` text DEFAULT 'general',
	`image_url` text,
	`image_public_id` text
);
--> statement-breakpoint
CREATE TABLE `order_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text,
	`user_id` integer,
	`menu_id` integer,
	`food_name` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`amount` real NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`menu_id`) REFERENCES `menu`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	`amount` real NOT NULL,
	`status` text DEFAULT 'placed' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`takeaway_location` text NOT NULL,
	`merchant_request_id` text,
	`checkout_request_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`register_number` text NOT NULL,
	`department` text NOT NULL,
	`username` text NOT NULL,
	`graduation_year` integer NOT NULL,
	`password` text NOT NULL,
	`avatar_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_register_number_unique` ON `users` (`register_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);