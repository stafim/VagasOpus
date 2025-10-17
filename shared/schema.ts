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
  passwordHash: varchar("password_hash"), // For local authentication
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
  cnpj: varchar("cnpj", { length: 18 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  industryType: varchar("industry_type", { length: 100 }),
  description: text("description"),
  website: varchar("website"),
  logo: varchar("logo"),
  jobCounter: integer("job_counter").default(0), // Contador para IDs de vagas
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

// Clients table
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job status enum
export const jobStatusEnum = pgEnum("job_status", [
  "active", 
  "closed",
  "expired",
  "aberto",
  "aprovada",
  "em_recrutamento",
  "em_documentacao",
  "dp",
  "em_mobilizacao",
  "cancelada"
]);

// Contract type enum
export const contractTypeEnum = pgEnum("contract_type", [
  "clt",
  "pj", 
  "freelancer",
  "estagio",
  "temporario"
]);

// Job opening reason enum
export const jobReasonEnum = pgEnum("job_reason", [
  "substituicao",
  "aumento_quadro"
]);

// Gender enum
export const genderEnum = pgEnum("gender", [
  "masculino",
  "feminino",
  "indiferente"
]);

// Work scale enum
export const workScaleEnum = pgEnum("work_scale", [
  "5x1",
  "5x2",
  "6x1",
  "12x36",
  "outro"
]);

// Unhealthiness level enum
export const unhealthinessEnum = pgEnum("unhealthiness_level", [
  "nao",
  "10",
  "20",
  "40"
]);

// Job type enum
export const jobTypeEnum = pgEnum("job_type", [
  "produtiva",
  "improdutiva"
]);

// Permission system enums
export const roleTypeEnum = pgEnum("role_type", [
  "admin",
  "hr_manager", 
  "recruiter",
  "interviewer",
  "viewer",
  "approver",
  "manager"
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

// Professions table
export const professions = pgTable("professions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // e.g., "Tecnologia", "Marketing", "Vendas"
  union: varchar("union", { length: 255 }), // Sindicato
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work Scales table - Parametrized work scales
export const workScales = pgTable("work_scales", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(), // e.g., "5x1", "5x2", "6x1", "12x36"
  description: text("description"), // Optional description
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Benefits table - Parametrized benefits
export const benefits = pgTable("benefits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(), // e.g., "Vale Alimentação", "Plano de Saúde"
  description: text("description"), // Optional description
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs table - temporarily keeping both title and professionId for migration
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobCode: varchar("job_code", { length: 50 }).unique(), // ID legível da vaga (ex: OPUS001, TELOS001)
  title: varchar("title", { length: 255 }), // Keep existing field temporarily
  professionId: varchar("profession_id").references(() => professions.id), // Add new field as optional
  description: text("description"),
  requirements: text("requirements"),
  companyId: varchar("company_id").references(() => companies.id),
  costCenterId: varchar("cost_center_id").references(() => costCenters.id),
  recruiterId: varchar("recruiter_id").references(() => users.id),
  department: varchar("department"),
  location: varchar("location"),
  contractType: contractTypeEnum("contract_type").default("clt"),
  jobType: jobTypeEnum("job_type"), // Tipo de vaga: produtiva (faturar) ou improdutiva (sem faturar)
  
  // Novos campos detalhados da vaga
  openingDate: timestamp("opening_date"), // Data de abertura da vaga
  startDate: timestamp("start_date"), // Data de início
  openingReason: jobReasonEnum("opening_reason"), // Motivo: substituição ou aumento de quadro
  replacementEmployeeName: varchar("replacement_employee_name", { length: 255 }), // Nome do colaborador a ser substituído (quando motivo = substituição)
  ageRangeMin: integer("age_range_min"), // Idade mínima
  ageRangeMax: integer("age_range_max"), // Idade máxima
  specifications: text("specifications"), // Especificações detalhadas
  clientId: varchar("client_id").references(() => clients.id), // Cliente
  vacancyQuantity: integer("vacancy_quantity").default(1), // Quantidade de vagas
  gender: genderEnum("gender").default("indiferente"), // Sexo
  workScaleId: varchar("work_scale_id").references(() => workScales.id), // Escala de trabalho (parametrizada)
  workHours: varchar("work_hours", { length: 100 }), // Horário de trabalho
  
  // Remuneração e benefícios
  salaryMin: decimal("salary_min", { precision: 10, scale: 2 }),
  bonus: decimal("bonus", { precision: 10, scale: 2 }), // Gratificação
  hasHazardPay: boolean("has_hazard_pay").default(false), // Periculosidade
  unhealthinessLevel: unhealthinessEnum("unhealthiness_level").default("nao"), // Insalubridade
  
  status: jobStatusEnum("status").default("draft"),
  createdBy: varchar("created_by").references(() => users.id),
  expiresAt: timestamp("expires_at"),
  slaDeadline: timestamp("sla_deadline"), // SLA de 14 dias para fechamento da vaga
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job-Benefits relationship table (many-to-many)
export const jobBenefits = pgTable("job_benefits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id, { onDelete: "cascade" }).notNull(),
  benefitId: varchar("benefit_id").references(() => benefits.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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

// Selection process status enum
export const selectionStatusEnum = pgEnum("selection_status", [
  "applied",
  "under_review", 
  "phone_screening",
  "technical_test",
  "interview_scheduled",
  "interview_completed", 
  "final_review",
  "approved",
  "rejected",
  "hired"
]);

// Interview types enum
export const interviewTypeEnum = pgEnum("interview_type", [
  "phone_screening",
  "technical",
  "behavioral", 
  "final",
  "panel"
]);

// Kanban stages enum
export const kanbanStageEnum = pgEnum("kanban_stage", [
  "entrevista_inicial",
  "teste_tecnico",
  "entrevista_gestor",
  "proposta",
  "contratado"
]);

// Candidates table (global pool of candidates)
export const candidates = pgTable("candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  resume: varchar("resume"), // URL to resume file
  skills: text("skills"),
  experience: text("experience"),
  education: text("education"),
  linkedinUrl: varchar("linkedin_url"),
  portfolioUrl: varchar("portfolio_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table (links candidates to specific jobs)
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id).notNull(),
  candidateId: varchar("candidate_id").references(() => candidates.id).notNull(),
  coverLetter: text("cover_letter"),
  status: selectionStatusEnum("status").default("applied"),
  currentStage: varchar("current_stage").default("application_received"),
  kanbanStage: kanbanStageEnum("kanban_stage").default("entrevista_inicial"),
  overallScore: integer("overall_score").default(0), // Score out of 100
  rejectionReason: text("rejection_reason"),
  notes: text("notes"), // Internal notes about candidate
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Selection process stages table
export const selectionStages = pgTable("selection_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").references(() => jobs.id),
  name: varchar("name", { length: 255 }).notNull(), // "Application Review", "Phone Screen", etc.
  description: text("description"),
  order: integer("order").notNull(), // Stage order (1, 2, 3...)
  isRequired: boolean("is_required").default(true),
  passingScore: integer("passing_score").default(70), // Minimum score to advance
  createdAt: timestamp("created_at").defaultNow(),
});

// Interviews table
export const interviews = pgTable("interviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => applications.id),
  interviewerId: varchar("interviewer_id").references(() => users.id),
  stageId: varchar("stage_id").references(() => selectionStages.id),
  type: interviewTypeEnum("type").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  duration: integer("duration").default(60), // Duration in minutes
  location: varchar("location"), // Room/link
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled, rescheduled
  score: integer("score"), // Interview score out of 100
  feedback: text("feedback"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interview evaluation criteria table
export const interviewCriteria = pgTable("interview_criteria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  interviewId: varchar("interview_id").references(() => interviews.id),
  criterion: varchar("criterion", { length: 255 }).notNull(), // "Technical Skills", "Communication", etc.
  score: integer("score").notNull(), // Score out of 10
  notes: text("notes"),
});

// Application stage progress tracking
export const applicationStageProgress = pgTable("application_stage_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: varchar("application_id").references(() => applications.id),
  stageId: varchar("stage_id").references(() => selectionStages.id),
  status: varchar("status").default("pending"), // pending, in_progress, completed, failed
  score: integer("score"), // Score for this stage
  feedback: text("feedback"),
  completedAt: timestamp("completed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const professionsRelations = relations(professions, ({ many }) => ({
  jobs: many(jobs),
}));

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
  profession: one(professions, {
    fields: [jobs.professionId],
    references: [professions.id],
  }),
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

export const candidatesRelations = relations(candidates, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  job: one(jobs, {
    fields: [applications.jobId],
    references: [jobs.id],
  }),
  candidate: one(candidates, {
    fields: [applications.candidateId],
    references: [candidates.id],
  }),
  interviews: many(interviews),
  stageProgress: many(applicationStageProgress),
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
  interviews: many(interviews),
}));

export const selectionStagesRelations = relations(selectionStages, ({ one, many }) => ({
  job: one(jobs, {
    fields: [selectionStages.jobId],
    references: [jobs.id],
  }),
  interviews: many(interviews),
  stageProgress: many(applicationStageProgress),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  application: one(applications, {
    fields: [interviews.applicationId],
    references: [applications.id],
  }),
  interviewer: one(users, {
    fields: [interviews.interviewerId],
    references: [users.id],
  }),
  stage: one(selectionStages, {
    fields: [interviews.stageId],
    references: [selectionStages.id],
  }),
  criteria: many(interviewCriteria),
}));

export const interviewCriteriaRelations = relations(interviewCriteria, ({ one }) => ({
  interview: one(interviews, {
    fields: [interviewCriteria.interviewId],
    references: [interviews.id],
  }),
}));

export const applicationStageProgressRelations = relations(applicationStageProgress, ({ one }) => ({
  application: one(applications, {
    fields: [applicationStageProgress.applicationId],
    references: [applications.id],
  }),
  stage: one(selectionStages, {
    fields: [applicationStageProgress.stageId],
    references: [selectionStages.id],
  }),
  reviewer: one(users, {
    fields: [applicationStageProgress.reviewedBy],
    references: [users.id],
  }),
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

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkScaleSchema = createInsertSchema(workScales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBenefitSchema = createInsertSchema(benefits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobBenefitSchema = createInsertSchema(jobBenefits).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = z.object({
  professionId: z.string().min(1, "Profissão é obrigatória"),
  companyId: z.string().min(1, "Empresa é obrigatória"),
  description: z.string().optional(),
  costCenterId: z.string().optional(),
  recruiterId: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  contractType: z.enum(["clt", "pj", "freelancer", "estagio", "temporario"]).default("clt"),
  jobType: z.enum(["produtiva", "improdutiva"]).optional(),
  salaryMin: z.string().optional(),
  status: z.enum(["draft", "active", "paused", "closed", "expired", "aberto", "aprovada", "em_recrutamento", "em_documentacao"]).default("draft"),
  createdBy: z.string().optional(),
  expiresAt: z.string().optional(),
  slaDeadline: z.string().optional(),
  
  // Novos campos detalhados
  openingDate: z.string().optional(),
  startDate: z.string().optional(),
  openingReason: z.enum(["substituicao", "aumento_quadro"]).optional(),
  replacementEmployeeName: z.string().optional(),
  ageRangeMin: z.number().optional(),
  ageRangeMax: z.number().optional(),
  specifications: z.string().optional(),
  clientId: z.string().optional(),
  vacancyQuantity: z.number().optional(),
  gender: z.enum(["masculino", "feminino", "indiferente"]).optional(),
  workScaleId: z.string().optional(),
  workHours: z.string().optional(),
  
  // Remuneração e benefícios
  bonus: z.string().optional(),
  hasHazardPay: z.boolean().optional(),
  unhealthinessLevel: z.enum(["nao", "10", "20", "40"]).optional(),
  
  // Benefícios (array of benefit IDs)
  benefitIds: z.array(z.string()).optional(),
});

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});

export const insertSelectionStageSchema = createInsertSchema(selectionStages).omit({
  id: true,
  createdAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterviewCriteriaSchema = createInsertSchema(interviewCriteria).omit({
  id: true,
});

export const insertApplicationStageProgressSchema = createInsertSchema(applicationStageProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserCompanyRoleSchema = createInsertSchema(userCompanyRoles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
});

export const insertProfessionSchema = createInsertSchema(professions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = z.infer<typeof insertCostCenterSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type SelectionStage = typeof selectionStages.$inferSelect;
export type InsertSelectionStage = z.infer<typeof insertSelectionStageSchema>;

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export type InterviewCriteria = typeof interviewCriteria.$inferSelect;
export type InsertInterviewCriteria = z.infer<typeof insertInterviewCriteriaSchema>;

export type ApplicationStageProgress = typeof applicationStageProgress.$inferSelect;
export type InsertApplicationStageProgress = z.infer<typeof insertApplicationStageProgressSchema>;

export type UserCompanyRole = typeof userCompanyRoles.$inferSelect;
export type InsertUserCompanyRole = z.infer<typeof insertUserCompanyRoleSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type Profession = typeof professions.$inferSelect;
export type InsertProfession = z.infer<typeof insertProfessionSchema>;

export type WorkScale = typeof workScales.$inferSelect;
export type InsertWorkScale = z.infer<typeof insertWorkScaleSchema>;

export type Benefit = typeof benefits.$inferSelect;
export type InsertBenefit = z.infer<typeof insertBenefitSchema>;

export type JobBenefit = typeof jobBenefits.$inferSelect;
export type InsertJobBenefit = z.infer<typeof insertJobBenefitSchema>;

// Extended types for joined queries
export type JobWithDetails = Job & {
  profession?: Profession;
  company?: Company;
  costCenter?: CostCenter;
  createdByUser?: User;
  applications?: Application[];
  applicationsCount?: number;
  selectionStages?: SelectionStage[];
};

export type ApplicationWithDetails = Application & {
  job?: Job;
  candidate?: Candidate;
  interviews?: Interview[];
  stageProgress?: ApplicationStageProgress[];
  currentStageInfo?: SelectionStage;
};

export type InterviewWithDetails = Interview & {
  application?: Application;
  interviewer?: User;
  stage?: SelectionStage;
  criteria?: InterviewCriteria[];
  candidate?: {
    name: string;
    email: string;
    jobTitle: string;
  };
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

// Selection process response types
export type SelectionProcessMetrics = {
  totalApplications: number;
  byStatus: Array<{ status: string; count: number }>;
  averageTimeToHire: number; // in days
  conversionRates: {
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  };
};

export type InterviewCalendarResponse = {
  upcomingInterviews: InterviewWithDetails[];
  todayInterviews: InterviewWithDetails[];
  overdueInterviews: InterviewWithDetails[];
};

export type JobClosureReportItem = {
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  closedJobsCount: number;
  averageDaysToClose: number;
  averageSalary: number;
};

export type ClosedJobsByRecruiterItem = {
  recruiterId: string;
  recruiterName: string;
  recruiterEmail: string;
  jobId: string;
  jobCode: string;
  professionName: string;
  companyName: string;
  closedDate: string;
  daysToClose: number;
  salary: number;
};

export type OpenJobsByMonthResponse = Array<{ month: string; count: number }>;

export type JobsByCreatorResponse = Array<{ 
  creatorId: string;
  creatorName: string; 
  count: number 
}>;

export type JobsByCompanyResponse = Array<{ 
  companyId: string;
  companyName: string; 
  count: number 
}>;

export type JobsSLAResponse = {
  withinSLA: number;
  outsideSLA: number;
};
