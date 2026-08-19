CREATE TABLE `customerCredentials` (
	`userId` int NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`passwordUpdatedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerCredentials_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `paymentRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planCode` enum('solo','pro') NOT NULL DEFAULT 'solo',
	`preferredMethod` enum('bkash','nagad','rocket','bank_transfer') NOT NULL,
	`paymentReference` varchar(160),
	`payerNumber` varchar(40),
	`userNote` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`ownerNote` text,
	`reviewedAt` timestamp,
	`reviewedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `subscriptions` MODIFY COLUMN `status` enum('inactive','trial','active','expired') NOT NULL DEFAULT 'inactive';--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `planCode` enum('solo','pro') DEFAULT 'solo' NOT NULL;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `customerCredentials` ADD CONSTRAINT `customerCredentials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentRequests` ADD CONSTRAINT `paymentRequests_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paymentRequests` ADD CONSTRAINT `paymentRequests_reviewedByUserId_users_id_fk` FOREIGN KEY (`reviewedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `payment_requests_user_created_index` ON `paymentRequests` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `payment_requests_status_created_index` ON `paymentRequests` (`status`,`createdAt`);