CREATE TABLE `analytics_events` (
	`event_id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`user_id` text,
	`event_name` text NOT NULL,
	`track` text,
	`pace` text,
	`topic_id` integer,
	`world_number` integer,
	`required` integer DEFAULT false NOT NULL,
	`occurred_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_events_name_time_idx` ON `analytics_events` (`event_name`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_session_time_idx` ON `analytics_events` (`session_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_user_time_idx` ON `analytics_events` (`user_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `analytics_events_time_idx` ON `analytics_events` (`occurred_at`);--> statement-breakpoint
CREATE TABLE `beta_feedback` (
	`feedback_id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`user_id` text,
	`category` text NOT NULL,
	`rating` integer NOT NULL,
	`difficulty` text,
	`message` text NOT NULL,
	`contact_allowed` integer DEFAULT false NOT NULL,
	`track` text,
	`pace` text,
	`topic_id` integer,
	`world_number` integer,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `beta_feedback_created_idx` ON `beta_feedback` (`created_at`);--> statement-breakpoint
CREATE INDEX `beta_feedback_session_created_idx` ON `beta_feedback` (`session_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `beta_feedback_user_created_idx` ON `beta_feedback` (`user_id`,`created_at`);