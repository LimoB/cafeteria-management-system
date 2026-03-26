ALTER TABLE `custom_orders` ADD `price` real DEFAULT 0;--> statement-breakpoint
ALTER TABLE `custom_orders` ADD `payment_status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `custom_orders` ADD `merchant_request_id` text;--> statement-breakpoint
ALTER TABLE `custom_orders` ADD `checkout_request_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `mpesa_receipt_number` text;