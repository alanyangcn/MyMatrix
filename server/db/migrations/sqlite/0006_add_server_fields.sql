ALTER TABLE `server_records` ADD COLUMN `start_time` integer;
ALTER TABLE `server_records` ADD COLUMN `price` text;
ALTER TABLE `server_records` ADD COLUMN `currency` text;
ALTER TABLE `server_records` ADD COLUMN `auto_renew` integer NOT NULL DEFAULT 0;
