CREATE TABLE `website_records` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `owner_id` integer NOT NULL,
  `name` text NOT NULL,
  `url` text,
  `notes_encrypted` text,
  `created_by` integer,
  `created_at` integer NOT NULL,
  `updated_by` integer,
  `updated_at` integer NOT NULL,
  `is_deleted` integer NOT NULL DEFAULT 0,
  `deleted_at` integer,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `website_records_owner_id_idx` ON `website_records` (`owner_id`);
CREATE INDEX `website_records_is_deleted_idx` ON `website_records` (`is_deleted`);

CREATE TABLE `website_account_records` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `owner_id` integer NOT NULL,
  `website_id` integer NOT NULL,
  `account_name` text NOT NULL,
  `login_identifier` text,
  `password_encrypted` text,
  `notes_encrypted` text,
  `created_by` integer,
  `created_at` integer NOT NULL,
  `updated_by` integer,
  `updated_at` integer NOT NULL,
  `is_deleted` integer NOT NULL DEFAULT 0,
  `deleted_at` integer,
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`website_id`) REFERENCES `website_records`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `website_account_records_owner_id_idx` ON `website_account_records` (`owner_id`);
CREATE INDEX `website_account_records_website_id_idx` ON `website_account_records` (`website_id`);
CREATE INDEX `website_account_records_is_deleted_idx` ON `website_account_records` (`is_deleted`);
