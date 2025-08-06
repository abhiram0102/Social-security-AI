import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("user"),
  lastLogin: timestamp("last_login"),
  created: timestamp("created").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

// Scans table
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  target: text("target").notNull(),
  scanType: text("scan_type").notNull(),
  status: text("status").default("pending"),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  options: jsonb("options"),
});

export const insertScanSchema = createInsertSchema(scans).pick({
  userId: true,
  target: true,
  scanType: true,
  options: true,
});

// Vulnerabilities table
export const vulnerabilities = pgTable("vulnerabilities", {
  id: serial("id").primaryKey(),
  scanId: integer("scan_id").references(() => scans.id),
  name: text("name").notNull(),
  cveId: text("cve_id"),
  description: text("description"),
  severity: text("severity").notNull(),
  cvssScore: decimal("cvss_score", { precision: 3, scale: 1 }),
  affectedHost: text("affected_host").notNull(),
  port: integer("port"),
  service: text("service"),
  remediation: text("remediation"),
  details: jsonb("details"),
  discovered: timestamp("discovered").defaultNow(),
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).pick({
  scanId: true,
  name: true,
  cveId: true,
  description: true,
  severity: true,
  cvssScore: true,
  affectedHost: true,
  port: true,
  service: true,
  remediation: true,
  details: true,
});

// Threats table
export const threats = pgTable("threats", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  source: text("source").notNull(),
  target: text("target").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  description: text("description"),
  mitigated: boolean("mitigated").default(false),
  mitigationTime: timestamp("mitigation_time"),
  details: jsonb("details"),
});

export const insertThreatSchema = createInsertSchema(threats).pick({
  type: true,
  severity: true,
  source: true,
  target: true,
  description: true,
  details: true,
});

// Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  scanId: integer("scan_id").references(() => scans.id),
  name: text("name").notNull(),
  created: timestamp("created").defaultNow(),
  format: text("format").default("pdf"),
  content: text("content"),
  size: integer("size"),
});

export const insertReportSchema = createInsertSchema(reports).pick({
  userId: true,
  scanId: true,
  name: true,
  format: true,
  content: true,
});

// API keys table
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  created: timestamp("created").defaultNow(),
  lastUsed: timestamp("last_used"),
  expires: timestamp("expires"),
  active: boolean("active").default(true),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  userId: true,
  name: true,
  key: true,
  expires: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;

export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;

export type Threat = typeof threats.$inferSelect;
export type InsertThreat = z.infer<typeof insertThreatSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
