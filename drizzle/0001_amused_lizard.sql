CREATE TABLE `activityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` varchar(40) NOT NULL,
	`entityId` int,
	`action` varchar(120) NOT NULL,
	`detail` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activityLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`email` varchar(320),
	`phone` varchar(40),
	`address` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `freelancerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessName` varchar(160) NOT NULL,
	`logoUrl` text,
	`phone` varchar(40) NOT NULL,
	`email` varchar(320) NOT NULL,
	`bkashNumber` varchar(40),
	`nagadNumber` varchar(40),
	`rocketNumber` varchar(40),
	`bankTransferInstructions` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `freelancerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `freelancer_profiles_user_id_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `invoiceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`description` varchar(300) NOT NULL,
	`quantityHundredths` int NOT NULL DEFAULT 100,
	`unitAmountPaisa` int NOT NULL,
	`lineTotalPaisa` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoiceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoicePayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`userId` int NOT NULL,
	`amountPaisa` int NOT NULL,
	`method` enum('bkash','nagad','rocket','bank_transfer') NOT NULL,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoicePayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoiceViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientId` int,
	`invoiceNumber` varchar(40) NOT NULL,
	`publicToken` varchar(64) NOT NULL,
	`clientName` varchar(160) NOT NULL,
	`clientEmail` varchar(320),
	`clientPhone` varchar(40),
	`clientAddress` text,
	`billingType` enum('fixed_price','itemized') NOT NULL DEFAULT 'itemized',
	`issueDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` timestamp,
	`status` enum('draft','sent','viewed','partially_paid','paid','overdue') NOT NULL DEFAULT 'draft',
	`subtotalPaisa` int NOT NULL DEFAULT 0,
	`discountPaisa` int NOT NULL DEFAULT 0,
	`totalPaisa` int NOT NULL DEFAULT 0,
	`paidAmountPaisa` int NOT NULL DEFAULT 0,
	`notes` text,
	`sentAt` timestamp,
	`viewedAt` timestamp,
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_user_number_unique` UNIQUE(`userId`,`invoiceNumber`),
	CONSTRAINT `invoices_public_token_unique` UNIQUE(`publicToken`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('inactive','active','expired') NOT NULL DEFAULT 'inactive',
	`activeUntil` timestamp,
	`lastPaymentMethod` enum('bkash','nagad','rocket','bank_transfer'),
	`ownerNote` text,
	`updatedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_user_id_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `activityLogs` ADD CONSTRAINT `activityLogs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clients` ADD CONSTRAINT `clients_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `freelancerProfiles` ADD CONSTRAINT `freelancerProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoiceItems` ADD CONSTRAINT `invoiceItems_invoiceId_invoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoicePayments` ADD CONSTRAINT `invoicePayments_invoiceId_invoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoicePayments` ADD CONSTRAINT `invoicePayments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoiceViews` ADD CONSTRAINT `invoiceViews_invoiceId_invoices_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `activity_logs_user_created_index` ON `activityLogs` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `clients_user_id_name_index` ON `clients` (`userId`,`name`);--> statement-breakpoint
CREATE INDEX `invoice_items_invoice_id_index` ON `invoiceItems` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `invoice_payments_invoice_id_index` ON `invoicePayments` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `invoice_views_invoice_id_index` ON `invoiceViews` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `invoices_user_status_due_index` ON `invoices` (`userId`,`status`,`dueDate`);