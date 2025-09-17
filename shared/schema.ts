import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("user"), // user, admin, recruiter
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  website: varchar("website"),
  logo: varchar("logo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Cost centers table
export const costCenters = pgTable("cost_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  companyId: varchar("company_id").references(() => companies.id),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job status enum
export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "active", 
  "paused",
  "closed",
  "expired"
]);

// Contract type enum
export const contractTypeEnum = pgEnum("contract_type", [
  "clt",
  "pj", 
  "freelancer",
  "estagio",
  "temporario"
]);

// Permission system enums
export const roleTypeEnum = pgEnum("role_type", [
  "admin",
  "hr_manager", 
  "recruiter",
  "interviewer",
  "viewer"
]);

export const permissionTypeEnum = pgEnum("permission_type", [
  "create_jobs",
  "edit_jobs", 
  "delete_jobs",
  "view_jobs",
  "create_companies",
  "edit_companies",
  "delete_companies",
  "view_companies",
  "manage_cost_centers",
  "view_applications",
  "manage_applications",
  "interview_candidates",
  "hire_candidates",
  "view_reports",
  "export_data",
  "manage_users",
  "manage_permissions"
]);

// Jobs table
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requirements: text("requirements"),
  companyId: varchar("company_id").references(() => companies.id),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  department: varchar("department"),
  location: varchar("location"),
  contractType: contractTypeEnum("contract_type").default("clt"),
  salaryMin: decimal("salary_min", { precision: 10, scale: 2 }),
  salaryMax: decimal("salary_max", { precision: 10, scale: 2 }),
  status: jobStatusEnum("status").default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User-Company-Role assignments table
export const userCompanyRoles = pgTable("user_company_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  companyId: varchar("company_id").references(() => companies.id),
  role: roleTypeEnum("role").notNull(),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id), // Optional: restrict to specific cost center
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Role permissions mapping table
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  role: roleTypeEnum("role").notNull(),
  permission: permissionTypeEnum("permission").notNull(),
  isGranted: boolean("is_granted").default(true),
});

// Applications table
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  candidateName: varchar("candidate_name", { length: 255 }).notNull(),
  candidateEmail: varchar("candidate_email", { length: 255 }).notNull(),
  candidatePhone: varchar("candidate_phone"),
  resume: varchar("resume"), // URL to resume file
  coverLetter: text("cover_letter"),
  status: varchar("status").default("pending"), // pending, reviewing, approved, rejected
  appliedAt: timestamp("applied_at").defaultNow(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  costCenters: many(costCenters),
  jobs: many(jobs),
}));

export const costCentersRelations = relations(costCenters, ({ one, many }) => ({
  company: one(companies, {
    fields: [costCenters.companyId],
    references: [companies.id],
  }),
  jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  costCenter: one(costCenters, {
    fields: [jobs.costCenterId],
    references: [costCenters.id],
  }),
  createdBy: one(users, {
    fields: [jobs.createdBy],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
}));

export const userCompanyRolesRelations = relations(userCompanyRoles, ({ one }) => ({
  user: one(users, {
    fields: [userCompanyRoles.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [userCompanyRoles.companyId],
    references: [companies.id],
  }),
  costCenter: one(costCenters, {
    fields: [userCompanyRoles.costCenterId],
    references: [costCenters.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  companyRoles: many(userCompanyRoles),
  createdJobs: many(jobs),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCostCenterSchema = createInsertSchema(costCenters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
});

export const insertUserCompanyRoleSchema = createInsertSchema(userCompanyRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = z.infer<typeof insertCostCenterSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type UserCompanyRole = typeof userCompanyRoles.$inferSelect;
export type InsertUserCompanyRole = z.infer<typeof insertUserCompanyRoleSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

// Extended types for joined queries
export type JobWithDetails = Job & {
  company?: Company;
  costCenter?: CostCenter;
  createdByUser?: User;
  applications?: Application[];
  applicationsCount?: number;
};

export type CompanyWithCostCenters = Company & {
  costCenters?: CostCenter[];
  jobsCount?: number;
};

// API Response types
export type DashboardMetrics = {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalCompanies: number;
};

export type JobsByStatusResponse = Array<{ status: string; count: number }>;

export type ApplicationsByMonthResponse = Array<{ month: string; count: number }>;

export type JobsListResponse = JobWithDetails[];

export type CompaniesListResponse = CompanyWithCostCenters[];
