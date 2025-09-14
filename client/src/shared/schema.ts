import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(), // email
  password: text("password").notNull(),
  role: text("role").notNull().default("citizen"), // 'citizen' | 'governmental'
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  idType: text("id_type").notNull(), // nid | birthCert
  idNumber: text("id_number").notNull(),
  building: text("building").notNull(),
  floor: text("floor"), // optional
  street: text("street").notNull(),
  thana: text("thana").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  mobile: text("mobile").notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleBn: text("title_bn").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionBn: text("description_bn").notNull(),
  descriptionEn: text("description_en").notNull(),
  category: text("category").notNull(),
  budget: text("budget").notNull(),
  status: text("status").notNull(),
  imageUrl: text("image_url").notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectVotes = pgTable("project_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Special voting for home-page polls (top 4 projects)
export const specialProjectVotes = pgTable("special_project_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const polls = pgTable("polls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleBn: text("title_bn").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionBn: text("description_bn").notNull(),
  descriptionEn: text("description_en").notNull(),
  votes: integer("votes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleBn: text("title_bn").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionBn: text("description_bn").notNull(),
  descriptionEn: text("description_en").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  volunteers: integer("volunteers").default(0).notNull(),
  going: integer("going").default(0).notNull(),
  helpful: integer("helpful").default(0).notNull(),
  proposerId: varchar("proposer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Per-user event participation tracking
export const eventVolunteers = pgTable("event_volunteers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventGoings = pgTable("event_goings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventHelpfulVotes = pgTable("event_helpful_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pendingEvents = pgTable("pending_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleBn: text("title_bn").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionBn: text("description_bn").notNull(),
  descriptionEn: text("description_en").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
  volunteers: integer("volunteers").default(0).notNull(),
  going: integer("going").default(0).notNull(),
  helpful: integer("helpful").default(0).notNull(),
  proposerId: varchar("proposer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pendingApprovals = pgTable("pending_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(), // email
  password: text("password").notNull(),
  role: text("role").notNull().default("citizen"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  idType: text("id_type").notNull(),
  idNumber: text("id_number").notNull(),
  building: text("building").notNull(),
  floor: text("floor"),
  street: text("street").notNull(),
  thana: text("thana").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  mobile: text("mobile").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const threads = pgTable("threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleBn: text("title_bn").notNull(),
  titleEn: text("title_en").notNull(),
  contentBn: text("content_bn").notNull(),
  contentEn: text("content_en").notNull(),
  category: text("category").notNull(),
  authorId: varchar("author_id").notNull(),
  likes: integer("likes").default(0).notNull(),
  pinned: integer("pinned").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const threadComments = pgTable("thread_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull(),
  authorId: varchar("author_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleBn: text("title_bn").notNull(),
  titleEn: text("title_en").notNull(),
  messageBn: text("message_bn").notNull(),
  messageEn: text("message_en").notNull(),
  authorId: varchar("author_id").notNull(), // Government user who created the notification
  targetType: text("target_type").notNull(), // 'thana' | 'countrywide'
  targetThana: text("target_thana"), // null if countrywide
  isActive: integer("is_active").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationReads = pgTable("notification_reads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  notificationId: varchar("notification_id").notNull(),
  userId: varchar("user_id").notNull(),
  readAt: timestamp("read_at").defaultNow(),
});

export const aboutUs = pgTable("about_us", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleBn: text("title_bn").notNull(),
  titleEn: text("title_en").notNull(),
  contentBn: text("content_bn").notNull(),
  contentEn: text("content_en").notNull(),
  missionBn: text("mission_bn").notNull(),
  missionEn: text("mission_en").notNull(),
  visionBn: text("vision_bn").notNull(),
  visionEn: text("vision_en").notNull(),
  valuesBn: text("values_bn").notNull(),
  valuesEn: text("values_en").notNull(),
  imageUrl: text("image_url").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactInfo = pgTable("contact_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleBn: text("title_bn").notNull(),
  titleEn: text("title_en").notNull(),
  addressBn: text("address_bn").notNull(),
  addressEn: text("address_en").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  website: text("website").notNull(),
  officeHoursBn: text("office_hours_bn").notNull(),
  officeHoursEn: text("office_hours_en").notNull(),
  mapEmbed: text("map_embed"), // Google Maps embed code
  socialMedia: text("social_media"), // JSON string for social media links
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event participation tracking for certificates
export const eventParticipation = pgTable("event_participation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  participationType: text("participation_type").notNull(), // 'volunteer' | 'going'
  certificateGenerated: integer("certificate_generated").default(0).notNull(), // 0 = not generated, 1 = generated
  certificateUrl: text("certificate_url"), // URL to the generated certificate
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("new").notNull(), // 'new' | 'read' | 'replied' | 'closed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertPendingApprovalSchema = createInsertSchema(pendingApprovals).omit({ id: true });
export const insertThreadSchema = createInsertSchema(threads).omit({ id: true, createdAt: true, likes: true, pinned: true });
export const insertThreadCommentSchema = createInsertSchema(threadComments).omit({ id: true, createdAt: true });

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertPollSchema = createInsertSchema(polls).omit({
  id: true,
  createdAt: true,
  votes: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export const insertNotificationReadSchema = createInsertSchema(notificationReads).omit({
  id: true,
  readAt: true,
});

export const insertAboutUsSchema = createInsertSchema(aboutUs).omit({
  id: true,
  updatedAt: true,
});

export const insertContactInfoSchema = createInsertSchema(contactInfo).omit({
  id: true,
  updatedAt: true,
});

export const insertEventParticipationSchema = createInsertSchema(eventParticipation).omit({
  id: true,
  createdAt: true,
  certificateGenerated: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPendingApproval = z.infer<typeof insertPendingApprovalSchema>;
export type PendingApproval = typeof pendingApprovals.$inferSelect;
export type InsertThread = z.infer<typeof insertThreadSchema>;
export type Thread = typeof threads.$inferSelect;
export type InsertThreadComment = z.infer<typeof insertThreadCommentSchema>;
export type ThreadComment = typeof threadComments.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof polls.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type PendingEvent = typeof pendingEvents.$inferSelect;
export type ProjectVote = typeof projectVotes.$inferSelect;
export type EventVolunteer = typeof eventVolunteers.$inferSelect;
export type EventGoing = typeof eventGoings.$inferSelect;
export type EventHelpfulVote = typeof eventHelpfulVotes.$inferSelect;
export type SpecialProjectVote = typeof specialProjectVotes.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotificationRead = z.infer<typeof insertNotificationReadSchema>;
export type NotificationRead = typeof notificationReads.$inferSelect;
export type InsertAboutUs = z.infer<typeof insertAboutUsSchema>;
export type AboutUs = typeof aboutUs.$inferSelect;
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;
export type ContactInfo = typeof contactInfo.$inferSelect;
export type InsertEventParticipation = z.infer<typeof insertEventParticipationSchema>;
export type EventParticipation = typeof eventParticipation.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
