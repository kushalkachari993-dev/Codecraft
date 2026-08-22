CREATE TABLE `ai_review_usage` (
	`user_id` text NOT NULL,
	`usage_date` text NOT NULL,
	`review_count` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `usage_date`),
	FOREIGN KEY (`user_id`) REFERENCES `learners`(`user_id`) ON UPDATE no action ON DELETE cascade
);
