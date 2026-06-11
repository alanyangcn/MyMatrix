DROP INDEX IF EXISTS `users_email_unique`;
ALTER TABLE `users` RENAME COLUMN `email` TO `username`;
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
