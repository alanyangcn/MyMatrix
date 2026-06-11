ALTER TABLE `messages` ADD `created_by` integer;
ALTER TABLE `messages` ADD `updated_by` integer;
ALTER TABLE `messages` ADD `updated_at` integer NOT NULL DEFAULT 0;
ALTER TABLE `messages` ADD `is_deleted` integer NOT NULL DEFAULT 0;
ALTER TABLE `messages` ADD `deleted_at` integer;

CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `display_name` text NOT NULL,
  `password_hash` text NOT NULL,
  `role` text NOT NULL DEFAULT 'member',
  `created_by` integer,
  `created_at` integer NOT NULL,
  `updated_by` integer,
  `updated_at` integer NOT NULL,
  `is_deleted` integer NOT NULL DEFAULT 0,
  `deleted_at` integer
);

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
CREATE INDEX `users_is_deleted_idx` ON `users` (`is_deleted`);

CREATE TABLE `sessions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` integer NOT NULL,
  `last_used_at` integer,
  `created_by` integer,
  `created_at` integer NOT NULL,
  `updated_by` integer,
  `updated_at` integer NOT NULL,
  `is_deleted` integer NOT NULL DEFAULT 0,
  `deleted_at` integer,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);
CREATE INDEX `sessions_is_deleted_idx` ON `sessions` (`is_deleted`);

CREATE TABLE `authenticators` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `owner_id` integer NOT NULL,
  `issuer` text NOT NULL,
  `account_name` text NOT NULL,
  `secret_encrypted` text NOT NULL,
  `notes_encrypted` text,
  `created_by` integer,
  `created_at` integer NOT NULL,
  `updated_by` integer,
  `updated_at` integer NOT NULL,
  `is_deleted` integer NOT NULL DEFAULT 0,
  `deleted_at` integer,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `authenticators_owner_id_idx` ON `authenticators` (`owner_id`);
CREATE INDEX `authenticators_is_deleted_idx` ON `authenticators` (`is_deleted`);

CREATE TABLE `backup_code_sets` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `owner_id` integer NOT NULL,
  `provider` text NOT NULL,
  `account_name` text NOT NULL,
  `codes_encrypted` text NOT NULL,
  `notes_encrypted` text,
  `created_by` integer,
  `created_at` integer NOT NULL,
  `updated_by` integer,
  `updated_at` integer NOT NULL,
  `is_deleted` integer NOT NULL DEFAULT 0,
  `deleted_at` integer,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `backup_code_sets_owner_id_idx` ON `backup_code_sets` (`owner_id`);
CREATE INDEX `backup_code_sets_is_deleted_idx` ON `backup_code_sets` (`is_deleted`);

CREATE TABLE `server_records` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `owner_id` integer NOT NULL,
  `name` text NOT NULL,
  `provider` text,
  `ip_address` text NOT NULL,
  `login_name` text,
  `panel_url` text,
  `expires_at` integer,
  `remind_at` integer,
  `notes_encrypted` text,
  `created_by` integer,
  `created_at` integer NOT NULL,
  `updated_by` integer,
  `updated_at` integer NOT NULL,
  `is_deleted` integer NOT NULL DEFAULT 0,
  `deleted_at` integer,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `server_records_owner_id_idx` ON `server_records` (`owner_id`);
CREATE INDEX `server_records_remind_at_idx` ON `server_records` (`remind_at`);
CREATE INDEX `server_records_is_deleted_idx` ON `server_records` (`is_deleted`);

CREATE TABLE `domain_records` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `owner_id` integer NOT NULL,
  `domain` text NOT NULL,
  `registrar` text,
  `account_name` text,
  `expires_at` integer,
  `remind_at` integer,
  `auto_renew` integer NOT NULL DEFAULT 0,
  `notes_encrypted` text,
  `created_by` integer,
  `created_at` integer NOT NULL,
  `updated_by` integer,
  `updated_at` integer NOT NULL,
  `is_deleted` integer NOT NULL DEFAULT 0,
  `deleted_at` integer,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `domain_records_owner_id_idx` ON `domain_records` (`owner_id`);
CREATE INDEX `domain_records_remind_at_idx` ON `domain_records` (`remind_at`);
CREATE INDEX `domain_records_is_deleted_idx` ON `domain_records` (`is_deleted`);
