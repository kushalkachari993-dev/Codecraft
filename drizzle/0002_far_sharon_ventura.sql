CREATE TABLE `schema_migrations` (
	`version` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`applied_at` integer NOT NULL
);
