CREATE TABLE `platformSettings` (
	`id` int NOT NULL,
	`bkashNumber` varchar(40),
	`nagadNumber` varchar(40),
	`rocketNumber` varchar(40),
	`bankTransferInstructions` text,
	`supportEmail` varchar(320),
	`supportWhatsApp` varchar(40),
	`updatedByUserId` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platformSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `platformSettings` ADD CONSTRAINT `platformSettings_updatedByUserId_users_id_fk` FOREIGN KEY (`updatedByUserId`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;