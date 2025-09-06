import { pgTable, text, varchar, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  travelDNA: jsonb("travel_dna").$type<{
    adventureSeeker: number;
    spontaneous: number;
    cultural: number;
    social: number;
    active: number;
    personality: string;
    preferences: string[];
    pastTripAnalysis?: {
      restaurants: number;
      hiking: number;
      cultural: number;
      nightlife: number;
      shopping: number;
    };
    conversationStyle?: {
      tone: "casual" | "formal" | "humorous" | "enthusiastic";
      interests: string[];
      communicationPatterns: string[];
    };
  }>(),
  currentLocation: jsonb("current_location").$type<{
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    timezone: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizResponses = pgTable("quiz_responses", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  questionIndex: integer("question_index").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  rating: integer("rating").notNull(),
  category: text("category").notNull(),
  moods: jsonb("moods").$type<string[]>().notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  isHiddenGem: boolean("is_hidden_gem").default(true),
  location: jsonb("location").$type<{
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    address: string;
    neighborhood?: string;
  }>().notNull(),
  crowdData: jsonb("crowd_data").$type<{
    peakHours: string[];
    bestTimeToVisit: string;
    crowdLevel: "low" | "medium" | "high";
    lastUpdated: string;
  }>(),
  localInsights: jsonb("local_insights").$type<{
    discoveredBy: "local" | "traveler" | "ai";
    localTips: string[];
    seasonalInfo?: string;
    accessibilityInfo?: string;
  }>(),
});

export const itineraryItems = pgTable("itinerary_items", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  day: integer("day").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  category: text("category").notNull(),
  cost: integer("cost").notNull(),
  duration: text("duration").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  isCompleted: boolean("is_completed").default(false),
  isFavorited: boolean("is_favorited").default(false),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  message: text("message").notNull(),
  sender: text("sender").notNull(), // 'user' or 'ai'
  timestamp: timestamp("timestamp").defaultNow(),
  context: jsonb("context").$type<{
    currentLocation?: {
      latitude: number;
      longitude: number;
      city: string;
    };
    mood?: string;
    relatedRecommendations?: string[];
    personalizedTone?: "casual" | "formal" | "humorous" | "enthusiastic";
  }>(),
  aiPersonality: jsonb("ai_personality").$type<{
    responseStyle: string;
    knowledgeLevel: string;
    enthusiasm: number;
  }>(),
});

export const userBehavior = pgTable("user_behavior", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  actionType: text("action_type").notNull(), // 'visit', 'skip', 'favorite', 'rate'
  itemId: varchar("item_id"), // recommendation or itinerary item
  itemType: text("item_type").notNull(), // 'recommendation', 'itinerary_item'
  location: jsonb("location").$type<{
    latitude: number;
    longitude: number;
    city: string;
  }>(),
  mood: text("mood"),
  timeOfDay: text("time_of_day"),
  weatherCondition: text("weather_condition"),
  companionType: text("companion_type"), // 'solo', 'couple', 'family', 'friends'
  rating: integer("rating"),
  feedback: text("feedback"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const localPlaces = pgTable("local_places", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  location: jsonb("location").$type<{
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    address: string;
    neighborhood: string;
  }>().notNull(),
  discoveredBy: text("discovered_by").notNull(), // 'google_places', 'local_tip', 'user_generated'
  popularity: integer("popularity").default(0),
  crowdData: jsonb("crowd_data").$type<{
    peakHours: string[];
    bestTimeToVisit: string;
    crowdLevel: "low" | "medium" | "high";
    lastUpdated: string;
  }>(),
  localInsights: jsonb("local_insights").$type<{
    tips: string[];
    seasonalInfo?: string;
    priceRange?: "budget" | "mid" | "expensive";
    accessibilityInfo?: string;
  }>(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertQuizResponseSchema = createInsertSchema(quizResponses).omit({
  id: true,
  createdAt: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
});

export const insertItineraryItemSchema = createInsertSchema(itineraryItems).omit({
  id: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertUserBehaviorSchema = createInsertSchema(userBehavior).omit({
  id: true,
  timestamp: true,
});

export const insertLocalPlaceSchema = createInsertSchema(localPlaces).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type QuizResponse = typeof quizResponses.$inferSelect;
export type InsertQuizResponse = z.infer<typeof insertQuizResponseSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type ItineraryItem = typeof itineraryItems.$inferSelect;
export type InsertItineraryItem = z.infer<typeof insertItineraryItemSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type UserBehavior = typeof userBehavior.$inferSelect;
export type InsertUserBehavior = z.infer<typeof insertUserBehaviorSchema>;
export type LocalPlace = typeof localPlaces.$inferSelect;
export type InsertLocalPlace = z.infer<typeof insertLocalPlaceSchema>;
