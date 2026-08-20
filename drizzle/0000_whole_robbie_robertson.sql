CREATE TABLE `code_submissions` (
	`submission_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`track` text NOT NULL,
	`pace` text NOT NULL,
	`topic_id` integer NOT NULL,
	`topic` text NOT NULL,
	`stage` text NOT NULL,
	`code` text NOT NULL,
	`passed` integer NOT NULL,
	`score` integer NOT NULL,
	`feedback_json` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `learners`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `code_submissions_user_topic_idx` ON `code_submissions` (`user_id`,`track`,`pace`,`topic_id`);--> statement-breakpoint
CREATE INDEX `code_submissions_user_created_idx` ON `code_submissions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `learners` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `progress_snapshots` (
	`user_id` text PRIMARY KEY NOT NULL,
	`progress_json` text NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `learners`(`user_id`) ON UPDATE no action ON DELETE cascade
);
