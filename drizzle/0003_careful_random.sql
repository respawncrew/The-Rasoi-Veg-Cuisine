ALTER TABLE `businessSettings` ADD `pureVegetarian` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `businessSettings` ADD `takeawayAvailable` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `businessSettings` ADD `orderingNote` varchar(240);