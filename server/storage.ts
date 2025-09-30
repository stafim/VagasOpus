import {
  users,
  companies,
  costCenters,
  clients,
  jobs,
  applications,
  selectionStages,
  interviews,
  interviewCriteria,
  applicationStageProgress,
  userCompanyRoles,
  rolePermissions,
  professions,
  type User,
  type UpsertUser,
  type InsertUser,
  type Company,
  type InsertCompany,
  type CostCenter,
  type InsertCostCenter,
  type Client,
  type InsertClient,
  type Job,
  type InsertJob,
  type JobWithDetails,
  type CompanyWithCostCenters,
  type Application,
  type InsertApplication,
  type ApplicationWithDetails,
  type SelectionStage,
  type InsertSelectionStage,
  type Interview,
  type InsertInterview,
  type InterviewWithDetails,
  type InterviewCriteria,
  type InsertInterviewCriteria,
  type ApplicationStageProgress,
  type InsertApplicationStageProgress,
  type UserCompanyRole,
  type InsertUserCompanyRole,
  type RolePermission,
  type InsertRolePermission,
  type Profession,
  type InsertProfession,
  type SelectionProcessMetrics,
  type InterviewCalendarResponse,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Authentication operations (for local auth)
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; passwordHash: string; firstName?: string; lastName?: string }): Promise<User>;
  updateUserPassword(id: string, passwordHash: string): Promise<User>;
  getRecruiters(): Promise<User[]>;
  
  // Company operations
  getCompanies(): Promise<CompanyWithCostCenters[]>;
  getCompany(id: string): Promise<CompanyWithCostCenters | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  
  // Cost Center operations
  getCostCentersByCompany(companyId: string): Promise<CostCenter[]>;
  createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter>;
  updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter>;
  deleteCostCenter(id: string): Promise<void>;
  
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  
  // Profession operations
  getProfessions(): Promise<Profession[]>;
  getProfessionsByCategory(category: string): Promise<Profession[]>;
  getProfession(id: string): Promise<Profession | undefined>;
  createProfession(profession: InsertProfession): Promise<Profession>;
  updateProfession(id: string, profession: Partial<InsertProfession>): Promise<Profession>;
  deleteProfession(id: string): Promise<void>;

  // Job operations
  getJobs(limit?: number, offset?: number, search?: string, status?: string, companyId?: string, professionId?: string): Promise<JobWithDetails[]>;
  getJob(id: string): Promise<JobWithDetails | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  
  // Application operations
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  getApplicationWithDetails(id: string): Promise<ApplicationWithDetails | undefined>;
  getApplicationsWithJobDetails(): Promise<any[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application>;
  
  // Selection Stages operations
  getSelectionStagesByJob(jobId: string): Promise<SelectionStage[]>;
  createSelectionStage(stage: InsertSelectionStage): Promise<SelectionStage>;
  updateSelectionStage(id: string, stage: Partial<InsertSelectionStage>): Promise<SelectionStage>;
  deleteSelectionStage(id: string): Promise<void>;
  setupDefaultSelectionStages(jobId: string): Promise<void>;
  
  // Interview operations
  getInterviewsByApplication(applicationId: string): Promise<InterviewWithDetails[]>;
  getInterviewWithDetails(id: string): Promise<InterviewWithDetails | undefined>;
  getUpcomingInterviews(interviewerId?: string): Promise<InterviewWithDetails[]>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview>;
  deleteInterview(id: string): Promise<void>;
  
  // Interview Criteria operations
  getInterviewCriteria(interviewId: string): Promise<InterviewCriteria[]>;
  createInterviewCriteria(criteria: InsertInterviewCriteria): Promise<InterviewCriteria>;
  updateInterviewCriteria(id: string, criteria: Partial<InsertInterviewCriteria>): Promise<InterviewCriteria>;
  
  // Application Stage Progress operations
  getApplicationProgress(applicationId: string): Promise<ApplicationStageProgress[]>;
  createStageProgress(progress: InsertApplicationStageProgress): Promise<ApplicationStageProgress>;
  updateStageProgress(id: string, progress: Partial<InsertApplicationStageProgress>): Promise<ApplicationStageProgress>;
  advanceApplicationStage(applicationId: string, stageId: string, score: number, feedback?: string): Promise<void>;
  
  // Analytics operations
  getDashboardMetrics(): Promise<{
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalCompanies: number;
  }>;
  
  getJobsByStatus(): Promise<Array<{ status: string; count: number }>>;
  getApplicationsByMonth(): Promise<Array<{ month: string; count: number }>>;
  
  // Selection process analytics
  getSelectionProcessMetrics(companyId?: string, timeframe?: string): Promise<SelectionProcessMetrics>;
  getInterviewCalendar(interviewerId?: string): Promise<InterviewCalendarResponse>;
  getApplicationStatusDistribution(): Promise<Array<{ status: string; count: number }>>;
  getAverageTimeToHire(companyId?: string): Promise<number>;
  getConversionRates(companyId?: string): Promise<{
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  }>;
  
  // Permission operations
  getUserCompanyRoles(userId: string): Promise<UserCompanyRole[]>;
  getUserCompanyRoleById(id: string): Promise<UserCompanyRole | undefined>;
  getUserPermissions(userId: string, companyId: string): Promise<string[]>;
  assignUserToCompany(assignment: InsertUserCompanyRole): Promise<UserCompanyRole>;
  updateUserCompanyRole(id: string, role: string): Promise<UserCompanyRole>;
  removeUserFromCompany(userId: string, companyId: string): Promise<void>;
  getRolePermissions(): Promise<RolePermission[]>;
  setupDefaultRolePermissions(): Promise<void>;
  checkUserPermission(userId: string, companyId: string, permission: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Authentication operations (for local auth)
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: { email: string; passwordHash: string; firstName?: string; lastName?: string }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Get users that can be assigned as recruiters
  async getRecruiters(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Company operations
  async getCompanies(): Promise<CompanyWithCostCenters[]> {
    const companiesWithCounts = await db
      .select({
        id: companies.id,
        name: companies.name,
        description: companies.description,
        website: companies.website,
        logo: companies.logo,
        createdAt: companies.createdAt,
        updatedAt: companies.updatedAt,
        jobsCount: count(jobs.id),
      })
      .from(companies)
      .leftJoin(jobs, eq(companies.id, jobs.companyId))
      .groupBy(companies.id)
      .orderBy(desc(companies.createdAt));

    const companiesWithCostCenters = await Promise.all(
      companiesWithCounts.map(async (company) => {
        const costCentersList = await this.getCostCentersByCompany(company.id);
        return {
          ...company,
          costCenters: costCentersList,
        };
      })
    );

    return companiesWithCostCenters;
  }

  async getCompany(id: string): Promise<CompanyWithCostCenters | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    if (!company) return undefined;

    const costCentersList = await this.getCostCentersByCompany(id);
    const [jobsCount] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.companyId, id));

    return {
      ...company,
      costCenters: costCentersList,
      jobsCount: jobsCount.count,
    };
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: string): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Cost Center operations
  async getCostCentersByCompany(companyId: string): Promise<CostCenter[]> {
    return await db
      .select()
      .from(costCenters)
      .where(eq(costCenters.companyId, companyId))
      .orderBy(costCenters.name);
  }

  async createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter> {
    const [newCostCenter] = await db.insert(costCenters).values(costCenter).returning();
    return newCostCenter;
  }

  async updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter> {
    const [updatedCostCenter] = await db
      .update(costCenters)
      .set({ ...costCenter, updatedAt: new Date() })
      .where(eq(costCenters.id, id))
      .returning();
    return updatedCostCenter;
  }

  async deleteCostCenter(id: string): Promise<void> {
    await db.delete(costCenters).where(eq(costCenters.id, id));
  }

  // Client operations
  async getClients(): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.isActive, true))
      .orderBy(clients.name);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    // Soft delete
    await db
      .update(clients)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(clients.id, id));
  }

  // Profession operations
  async getProfessions(): Promise<Profession[]> {
    return await db.select().from(professions).where(eq(professions.isActive, true)).orderBy(professions.name);
  }

  async getProfessionsByCategory(category: string): Promise<Profession[]> {
    return await db.select().from(professions)
      .where(and(eq(professions.category, category), eq(professions.isActive, true)))
      .orderBy(professions.name);
  }

  async getProfession(id: string): Promise<Profession | undefined> {
    const [profession] = await db.select().from(professions).where(eq(professions.id, id));
    return profession;
  }

  async createProfession(profession: InsertProfession): Promise<Profession> {
    const [newProfession] = await db.insert(professions).values(profession).returning();
    return newProfession;
  }

  async updateProfession(id: string, profession: Partial<InsertProfession>): Promise<Profession> {
    const [updatedProfession] = await db
      .update(professions)
      .set({ ...profession, updatedAt: new Date() })
      .where(eq(professions.id, id))
      .returning();
    return updatedProfession;
  }

  async deleteProfession(id: string): Promise<void> {
    await db.delete(professions).where(eq(professions.id, id));
  }

  // Job operations
  async getJobs(limit = 50, offset = 0, search?: string, status?: string, companyId?: string, professionId?: string): Promise<JobWithDetails[]> {
    let baseQuery = db
      .select({
        id: jobs.id,
        title: jobs.title,
        professionId: jobs.professionId,
        description: jobs.description,
        requirements: jobs.requirements,
        companyId: jobs.companyId,
        costCenterId: jobs.costCenterId,
        recruiterId: jobs.recruiterId,
        department: jobs.department,
        location: jobs.location,
        contractType: jobs.contractType,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        status: jobs.status,
        createdBy: jobs.createdBy,
        expiresAt: jobs.expiresAt,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        profession: {
          id: professions.id,
          name: professions.name,
          description: professions.description,
          category: professions.category,
          isActive: professions.isActive,
          createdAt: professions.createdAt,
          updatedAt: professions.updatedAt,
        },
        company: {
          id: companies.id,
          name: companies.name,
          description: companies.description,
          website: companies.website,
          logo: companies.logo,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        },
        recruiter: {
          id: sql<string>`recruiter_users.id`,
          firstName: sql<string>`recruiter_users.first_name`,
          lastName: sql<string>`recruiter_users.last_name`,
          email: sql<string>`recruiter_users.email`,
        },
        applicationsCount: count(applications.id),
      })
      .from(jobs)
      .leftJoin(professions, eq(jobs.professionId, professions.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(sql`users as recruiter_users`, eq(jobs.recruiterId, sql`recruiter_users.id`))
      .leftJoin(applications, eq(jobs.id, applications.jobId))
      .groupBy(jobs.id, professions.id, companies.id, sql`recruiter_users.id`);

    const whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          ilike(jobs.title, `%${search}%`),
          ilike(professions.name, `%${search}%`),
          ilike(professions.category, `%${search}%`)
        )
      );
    }

    if (status) {
      whereConditions.push(eq(jobs.status, status));
    }

    if (companyId) {
      whereConditions.push(eq(jobs.companyId, companyId));
    }

    if (professionId) {
      whereConditions.push(eq(jobs.professionId, professionId));
    }

    if (whereConditions.length > 0) {
      baseQuery = baseQuery.where(and(...whereConditions));
    }

    const result = await baseQuery
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row,
      company: row.company?.id ? row.company : undefined,
      recruiter: row.recruiter?.id ? row.recruiter : undefined,
    }));
  }

  async getJob(id: string): Promise<JobWithDetails | undefined> {
    const [job] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        professionId: jobs.professionId,
        description: jobs.description,
        requirements: jobs.requirements,
        companyId: jobs.companyId,
        costCenterId: jobs.costCenterId,
        recruiterId: jobs.recruiterId,
        department: jobs.department,
        location: jobs.location,
        contractType: jobs.contractType,
        salaryMin: jobs.salaryMin,
        salaryMax: jobs.salaryMax,
        status: jobs.status,
        createdBy: jobs.createdBy,
        expiresAt: jobs.expiresAt,
        createdAt: jobs.createdAt,
        updatedAt: jobs.updatedAt,
        profession: {
          id: professions.id,
          name: professions.name,
          description: professions.description,
          category: professions.category,
          isActive: professions.isActive,
          createdAt: professions.createdAt,
          updatedAt: professions.updatedAt,
        },
        company: {
          id: companies.id,
          name: companies.name,
          description: companies.description,
          website: companies.website,
          logo: companies.logo,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        },
        recruiter: {
          id: sql<string>`recruiter_users.id`,
          firstName: sql<string>`recruiter_users.first_name`,
          lastName: sql<string>`recruiter_users.last_name`,
          email: sql<string>`recruiter_users.email`,
        },
        costCenter: {
          id: costCenters.id,
          name: costCenters.name,
          code: costCenters.code,
          companyId: costCenters.companyId,
          budget: costCenters.budget,
          createdAt: costCenters.createdAt,
          updatedAt: costCenters.updatedAt,
        },
      })
      .from(jobs)
      .leftJoin(professions, eq(jobs.professionId, professions.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(sql`users as recruiter_users`, eq(jobs.recruiterId, sql`recruiter_users.id`))
      .leftJoin(costCenters, eq(jobs.costCenterId, costCenters.id))
      .where(eq(jobs.id, id));

    if (!job) return undefined;

    const jobApplications = await this.getApplicationsByJob(id);

    return {
      ...job,
      profession: job.profession?.id ? job.profession : undefined,
      company: job.company?.id ? job.company : undefined,
      recruiter: job.recruiter?.id ? job.recruiter : undefined,
      costCenter: job.costCenter?.id ? job.costCenter : undefined,
      applications: jobApplications,
      applicationsCount: jobApplications.length,
    };
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  // Application operations
  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.appliedAt));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplicationStatus(id: string, status: string): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  async getApplicationWithDetails(id: string): Promise<ApplicationWithDetails | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id));
    
    if (!application) return undefined;

    // Get job details
    const job = await this.getJob(application.jobId!);
    
    // Get interviews
    const applicationInterviews = await this.getInterviewsByApplication(id);
    
    // Get stage progress
    const stageProgress = await this.getApplicationProgress(id);
    
    return {
      ...application,
      job,
      interviews: applicationInterviews,
      stageProgress,
    };
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  async getApplicationsWithJobDetails(): Promise<any[]> {
    const result = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        candidateName: applications.candidateName,
        candidateEmail: applications.candidateEmail,
        candidatePhone: applications.candidatePhone,
        resume: applications.resume,
        coverLetter: applications.coverLetter,
        status: applications.status,
        currentStage: applications.currentStage,
        kanbanStage: applications.kanbanStage,
        appliedAt: applications.appliedAt,
        job: {
          id: jobs.id,
          professionId: jobs.professionId,
          profession: {
            id: professions.id,
            name: professions.name,
          },
          company: {
            id: companies.id,
            name: companies.name,
          },
        },
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(professions, eq(jobs.professionId, professions.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .orderBy(desc(applications.appliedAt));

    return result.map(row => ({
      ...row,
      job: row.job?.id ? {
        ...row.job,
        profession: row.job.profession?.id ? row.job.profession : undefined,
        company: row.job.company?.id ? row.job.company : undefined,
      } : undefined,
    }));
  }

  // Selection Stages operations
  async getSelectionStagesByJob(jobId: string): Promise<SelectionStage[]> {
    return await db
      .select()
      .from(selectionStages)
      .where(eq(selectionStages.jobId, jobId))
      .orderBy(selectionStages.order);
  }

  async createSelectionStage(stage: InsertSelectionStage): Promise<SelectionStage> {
    const [newStage] = await db.insert(selectionStages).values(stage).returning();
    return newStage;
  }

  async updateSelectionStage(id: string, stage: Partial<InsertSelectionStage>): Promise<SelectionStage> {
    const [updatedStage] = await db
      .update(selectionStages)
      .set(stage)
      .where(eq(selectionStages.id, id))
      .returning();
    return updatedStage;
  }

  async deleteSelectionStage(id: string): Promise<void> {
    await db.delete(selectionStages).where(eq(selectionStages.id, id));
  }

  async setupDefaultSelectionStages(jobId: string): Promise<void> {
    const defaultStages = [
      {
        jobId,
        name: "Application Review",
        description: "Initial screening of application documents",
        order: 1,
        isRequired: true,
        passingScore: 60,
      },
      {
        jobId,
        name: "Phone Screening",
        description: "Brief phone interview to assess basic fit",
        order: 2,
        isRequired: true,
        passingScore: 70,
      },
      {
        jobId,
        name: "Technical Interview",
        description: "Technical skills assessment",
        order: 3,
        isRequired: true,
        passingScore: 75,
      },
      {
        jobId,
        name: "Final Interview",
        description: "Final interview with hiring manager",
        order: 4,
        isRequired: true,
        passingScore: 80,
      },
    ];

    // Only create if no stages exist
    const existingStages = await this.getSelectionStagesByJob(jobId);
    if (existingStages.length === 0) {
      for (const stage of defaultStages) {
        await this.createSelectionStage(stage);
      }
    }
  }

  // Interview operations
  async getInterviewsByApplication(applicationId: string): Promise<InterviewWithDetails[]> {
    const result = await db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .where(eq(interviews.applicationId, applicationId))
      .orderBy(interviews.scheduledAt);

    return result.map(row => ({
      ...row.interview,
      interviewer: row.interviewer,
      stage: row.stage,
      application: row.application,
      candidate: row.application ? {
        name: row.application.candidateName,
        email: row.application.candidateEmail,
        jobTitle: "Candidate", // Could be enhanced with job title lookup
      } : undefined,
    }));
  }

  async getInterviewWithDetails(id: string): Promise<InterviewWithDetails | undefined> {
    const result = await db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .where(eq(interviews.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    const criteria = await this.getInterviewCriteria(id);

    return {
      ...row.interview,
      interviewer: row.interviewer,
      stage: row.stage,
      application: row.application,
      criteria,
      candidate: row.application ? {
        name: row.application.candidateName,
        email: row.application.candidateEmail,
        jobTitle: "Candidate",
      } : undefined,
    };
  }

  async getUpcomingInterviews(interviewerId?: string): Promise<InterviewWithDetails[]> {
    let query = db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .where(and(
        sql`${interviews.scheduledAt} >= NOW()`,
        eq(interviews.status, "scheduled")
      ));

    if (interviewerId) {
      query = query.where(and(
        sql`${interviews.scheduledAt} >= NOW()`,
        eq(interviews.status, "scheduled"),
        eq(interviews.interviewerId, interviewerId)
      ));
    }

    const result = await query.orderBy(interviews.scheduledAt);

    return result.map(row => ({
      ...row.interview,
      interviewer: row.interviewer,
      stage: row.stage,
      application: row.application,
      candidate: row.application ? {
        name: row.application.candidateName,
        email: row.application.candidateEmail,
        jobTitle: "Candidate",
      } : undefined,
    }));
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async updateInterview(id: string, interview: Partial<InsertInterview>): Promise<Interview> {
    const [updatedInterview] = await db
      .update(interviews)
      .set({ ...interview, updatedAt: new Date() })
      .where(eq(interviews.id, id))
      .returning();
    return updatedInterview;
  }

  async deleteInterview(id: string): Promise<void> {
    await db.delete(interviews).where(eq(interviews.id, id));
  }

  // Interview Criteria operations
  async getInterviewCriteria(interviewId: string): Promise<InterviewCriteria[]> {
    return await db
      .select()
      .from(interviewCriteria)
      .where(eq(interviewCriteria.interviewId, interviewId));
  }

  async createInterviewCriteria(criteria: InsertInterviewCriteria): Promise<InterviewCriteria> {
    const [newCriteria] = await db.insert(interviewCriteria).values(criteria).returning();
    return newCriteria;
  }

  async updateInterviewCriteria(id: string, criteria: Partial<InsertInterviewCriteria>): Promise<InterviewCriteria> {
    const [updatedCriteria] = await db
      .update(interviewCriteria)
      .set(criteria)
      .where(eq(interviewCriteria.id, id))
      .returning();
    return updatedCriteria;
  }

  // Application Stage Progress operations
  async getApplicationProgress(applicationId: string): Promise<ApplicationStageProgress[]> {
    return await db
      .select()
      .from(applicationStageProgress)
      .where(eq(applicationStageProgress.applicationId, applicationId))
      .orderBy(applicationStageProgress.createdAt);
  }

  async createStageProgress(progress: InsertApplicationStageProgress): Promise<ApplicationStageProgress> {
    const [newProgress] = await db.insert(applicationStageProgress).values(progress).returning();
    return newProgress;
  }

  async updateStageProgress(id: string, progress: Partial<InsertApplicationStageProgress>): Promise<ApplicationStageProgress> {
    const [updatedProgress] = await db
      .update(applicationStageProgress)
      .set({ ...progress, updatedAt: new Date() })
      .where(eq(applicationStageProgress.id, id))
      .returning();
    return updatedProgress;
  }

  async advanceApplicationStage(applicationId: string, stageId: string, score: number, feedback?: string): Promise<void> {
    // Update current stage progress
    await this.createStageProgress({
      applicationId,
      stageId,
      status: "completed",
      score,
      feedback,
      completedAt: new Date(),
    });

    // Update application's current stage and overall score
    await this.updateApplication(applicationId, {
      currentStage: stageId,
      overallScore: score,
      updatedAt: new Date(),
    });
  }

  // Analytics operations
  async getDashboardMetrics(): Promise<{
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalCompanies: number;
  }> {
    const [totalJobsResult] = await db.select({ count: count() }).from(jobs);
    const [activeJobsResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.status, "active"));
    const [totalApplicationsResult] = await db.select({ count: count() }).from(applications);
    const [totalCompaniesResult] = await db.select({ count: count() }).from(companies);

    return {
      totalJobs: totalJobsResult.count,
      activeJobs: activeJobsResult.count,
      totalApplications: totalApplicationsResult.count,
      totalCompanies: totalCompaniesResult.count,
    };
  }

  async getJobsByStatus(): Promise<Array<{ status: string; count: number }>> {
    const result = await db
      .select({
        status: jobs.status,
        count: count(),
      })
      .from(jobs)
      .groupBy(jobs.status);
    
    return result.map(row => ({
      status: row.status || '',
      count: row.count
    }));
  }

  async getApplicationsByMonth(): Promise<Array<{ month: string; count: number }>> {
    return await db
      .select({
        month: sql<string>`TO_CHAR(${applications.appliedAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(applications)
      .where(sql`${applications.appliedAt} >= NOW() - INTERVAL '12 months'`)
      .groupBy(sql`TO_CHAR(${applications.appliedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${applications.appliedAt}, 'YYYY-MM')`);
  }

  // Selection process analytics
  async getSelectionProcessMetrics(companyId?: string, timeframe?: string): Promise<SelectionProcessMetrics> {
    let baseQuery = db.select().from(applications);
    
    if (companyId) {
      baseQuery = baseQuery.leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(eq(jobs.companyId, companyId)) as any;
    }

    const [totalAppsResult] = await db.select({ count: count() }).from(applications);
    const statusDistribution = await this.getApplicationStatusDistribution();
    const avgTimeToHire = await this.getAverageTimeToHire(companyId);
    const conversionRates = await this.getConversionRates(companyId);

    return {
      totalApplications: totalAppsResult.count,
      byStatus: statusDistribution,
      averageTimeToHire: avgTimeToHire,
      conversionRates,
    };
  }

  async getInterviewCalendar(interviewerId?: string): Promise<InterviewCalendarResponse> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Upcoming interviews (future)
    const upcomingInterviews = await this.getUpcomingInterviews(interviewerId);

    // Today's interviews
    let todayQuery = db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .where(and(
        sql`${interviews.scheduledAt} >= ${todayStart}`,
        sql`${interviews.scheduledAt} < ${todayEnd}`,
        eq(interviews.status, "scheduled")
      ));

    if (interviewerId) {
      todayQuery = todayQuery.where(and(
        sql`${interviews.scheduledAt} >= ${todayStart}`,
        sql`${interviews.scheduledAt} < ${todayEnd}`,
        eq(interviews.status, "scheduled"),
        eq(interviews.interviewerId, interviewerId)
      ));
    }

    const todayResult = await todayQuery.orderBy(interviews.scheduledAt);

    // Overdue interviews (past scheduled but still marked as scheduled)
    let overdueQuery = db
      .select({
        interview: interviews,
        interviewer: users,
        stage: selectionStages,
        application: applications,
      })
      .from(interviews)
      .leftJoin(users, eq(interviews.interviewerId, users.id))
      .leftJoin(selectionStages, eq(interviews.stageId, selectionStages.id))
      .leftJoin(applications, eq(interviews.applicationId, applications.id))
      .where(and(
        sql`${interviews.scheduledAt} < NOW()`,
        eq(interviews.status, "scheduled")
      ));

    if (interviewerId) {
      overdueQuery = overdueQuery.where(and(
        sql`${interviews.scheduledAt} < NOW()`,
        eq(interviews.status, "scheduled"),
        eq(interviews.interviewerId, interviewerId)
      ));
    }

    const overdueResult = await overdueQuery.orderBy(interviews.scheduledAt);

    const mapToDetails = (rows: any[]) => rows.map(row => ({
      ...row.interview,
      interviewer: row.interviewer,
      stage: row.stage,
      application: row.application,
      candidate: row.application ? {
        name: row.application.candidateName,
        email: row.application.candidateEmail,
        jobTitle: "Candidate",
      } : undefined,
    }));

    return {
      upcomingInterviews,
      todayInterviews: mapToDetails(todayResult),
      overdueInterviews: mapToDetails(overdueResult),
    };
  }

  async getApplicationStatusDistribution(): Promise<Array<{ status: string; count: number }>> {
    const result = await db
      .select({
        status: applications.status,
        count: count(),
      })
      .from(applications)
      .groupBy(applications.status);
    
    return result.map(row => ({
      status: row.status || '',
      count: row.count
    }));
  }

  async getAverageTimeToHire(companyId?: string): Promise<number> {
    let query = db
      .select({
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
      })
      .from(applications);

    if (companyId) {
      query = query
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(and(
          eq(applications.status, "hired"),
          eq(jobs.companyId, companyId)
        )) as any;
    } else {
      query = query.where(eq(applications.status, "hired"));
    }

    const hiredApplications = await query;
    
    if (hiredApplications.length === 0) return 0;

    const totalDays = hiredApplications.reduce((sum, app) => {
      const daysDiff = Math.floor((app.updatedAt!.getTime() - app.appliedAt!.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }, 0);

    return Math.round(totalDays / hiredApplications.length);
  }

  async getConversionRates(companyId?: string): Promise<{
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  }> {
    let baseQuery = db.select({ count: count() }).from(applications);
    
    if (companyId) {
      baseQuery = baseQuery
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(eq(jobs.companyId, companyId)) as any;
    }

    const [totalApps] = await baseQuery;
    
    let interviewsQuery = db.select({ count: count() }).from(applications);
    if (companyId) {
      interviewsQuery = interviewsQuery
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(and(
          sql`${applications.status} IN ('interview_scheduled', 'interview_completed', 'final_review', 'approved', 'hired')`,
          eq(jobs.companyId, companyId)
        )) as any;
    } else {
      interviewsQuery = interviewsQuery
        .where(sql`${applications.status} IN ('interview_scheduled', 'interview_completed', 'final_review', 'approved', 'hired')`);
    }

    const [appsWithInterviews] = await interviewsQuery;

    let offersQuery = db.select({ count: count() }).from(applications);
    if (companyId) {
      offersQuery = offersQuery
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(and(
          sql`${applications.status} IN ('approved', 'hired')`,
          eq(jobs.companyId, companyId)
        )) as any;
    } else {
      offersQuery = offersQuery
        .where(sql`${applications.status} IN ('approved', 'hired')`);
    }

    const [appsWithOffers] = await offersQuery;

    let hiredQuery = db.select({ count: count() }).from(applications);
    if (companyId) {
      hiredQuery = hiredQuery
        .leftJoin(jobs, eq(applications.jobId, jobs.id))
        .where(and(
          eq(applications.status, "hired"),
          eq(jobs.companyId, companyId)
        )) as any;
    } else {
      hiredQuery = hiredQuery.where(eq(applications.status, "hired"));
    }

    const [hiredApps] = await hiredQuery;

    const applicationToInterview = totalApps.count > 0 ? (appsWithInterviews.count / totalApps.count) * 100 : 0;
    const interviewToOffer = appsWithInterviews.count > 0 ? (appsWithOffers.count / appsWithInterviews.count) * 100 : 0;
    const offerToHire = appsWithOffers.count > 0 ? (hiredApps.count / appsWithOffers.count) * 100 : 0;

    return {
      applicationToInterview: Math.round(applicationToInterview * 100) / 100,
      interviewToOffer: Math.round(interviewToOffer * 100) / 100,
      offerToHire: Math.round(offerToHire * 100) / 100,
    };
  }

  // Permission operations
  async getUserCompanyRoles(userId: string): Promise<UserCompanyRole[]> {
    return await db
      .select()
      .from(userCompanyRoles)
      .where(and(eq(userCompanyRoles.userId, userId), eq(userCompanyRoles.isActive, true)))
      .orderBy(userCompanyRoles.createdAt);
  }

  async getUserCompanyRoleById(id: string): Promise<UserCompanyRole | undefined> {
    const [role] = await db
      .select()
      .from(userCompanyRoles)
      .where(eq(userCompanyRoles.id, id));
    return role;
  }

  async getUserPermissions(userId: string, companyId: string): Promise<string[]> {
    // Get user's roles in the company
    const userRoles = await db
      .select()
      .from(userCompanyRoles)
      .where(
        and(
          eq(userCompanyRoles.userId, userId),
          eq(userCompanyRoles.companyId, companyId),
          eq(userCompanyRoles.isActive, true)
        )
      );

    if (userRoles.length === 0) return [];

    // Get permissions for all user's roles and aggregate them
    const allPermissions = new Set<string>();
    
    for (const userRole of userRoles) {
      const permissions = await db
        .select({ permission: rolePermissions.permission })
        .from(rolePermissions)
        .where(
          and(
            eq(rolePermissions.role, userRole.role),
            eq(rolePermissions.isGranted, true)
          )
        );
      
      permissions.forEach(p => allPermissions.add(p.permission));
    }

    return Array.from(allPermissions);
  }

  async assignUserToCompany(assignment: InsertUserCompanyRole): Promise<UserCompanyRole> {
    const [newAssignment] = await db
      .insert(userCompanyRoles)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async updateUserCompanyRole(id: string, role: string): Promise<UserCompanyRole> {
    const [updatedRole] = await db
      .update(userCompanyRoles)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(userCompanyRoles.id, id))
      .returning();
    return updatedRole;
  }

  async removeUserFromCompany(userId: string, companyId: string): Promise<void> {
    await db
      .update(userCompanyRoles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(userCompanyRoles.userId, userId),
          eq(userCompanyRoles.companyId, companyId)
        )
      );
  }

  async getRolePermissions(): Promise<RolePermission[]> {
    return await db.select().from(rolePermissions).orderBy(rolePermissions.role);
  }

  async setupDefaultRolePermissions(): Promise<void> {
    // Clear existing permissions first to ensure idempotency
    await db.delete(rolePermissions);
    
    // Setup default permissions for different roles
    const defaultPermissions = [
      // Admin permissions - full access
      { role: "admin", permission: "create_jobs", isGranted: true },
      { role: "admin", permission: "edit_jobs", isGranted: true },
      { role: "admin", permission: "delete_jobs", isGranted: true },
      { role: "admin", permission: "view_jobs", isGranted: true },
      { role: "admin", permission: "create_companies", isGranted: true },
      { role: "admin", permission: "edit_companies", isGranted: true },
      { role: "admin", permission: "delete_companies", isGranted: true },
      { role: "admin", permission: "view_companies", isGranted: true },
      { role: "admin", permission: "manage_cost_centers", isGranted: true },
      { role: "admin", permission: "view_applications", isGranted: true },
      { role: "admin", permission: "manage_applications", isGranted: true },
      { role: "admin", permission: "interview_candidates", isGranted: true },
      { role: "admin", permission: "hire_candidates", isGranted: true },
      { role: "admin", permission: "view_reports", isGranted: true },
      { role: "admin", permission: "export_data", isGranted: true },
      { role: "admin", permission: "manage_users", isGranted: true },
      { role: "admin", permission: "manage_permissions", isGranted: true },

      // HR Manager permissions
      { role: "hr_manager", permission: "create_jobs", isGranted: true },
      { role: "hr_manager", permission: "edit_jobs", isGranted: true },
      { role: "hr_manager", permission: "delete_jobs", isGranted: true },
      { role: "hr_manager", permission: "view_jobs", isGranted: true },
      { role: "hr_manager", permission: "view_companies", isGranted: true },
      { role: "hr_manager", permission: "manage_cost_centers", isGranted: true },
      { role: "hr_manager", permission: "view_applications", isGranted: true },
      { role: "hr_manager", permission: "manage_applications", isGranted: true },
      { role: "hr_manager", permission: "interview_candidates", isGranted: true },
      { role: "hr_manager", permission: "hire_candidates", isGranted: true },
      { role: "hr_manager", permission: "view_reports", isGranted: true },
      { role: "hr_manager", permission: "export_data", isGranted: true },

      // Recruiter permissions
      { role: "recruiter", permission: "create_jobs", isGranted: true },
      { role: "recruiter", permission: "edit_jobs", isGranted: true },
      { role: "recruiter", permission: "view_jobs", isGranted: true },
      { role: "recruiter", permission: "view_companies", isGranted: true },
      { role: "recruiter", permission: "view_applications", isGranted: true },
      { role: "recruiter", permission: "manage_applications", isGranted: true },
      { role: "recruiter", permission: "interview_candidates", isGranted: true },
      { role: "recruiter", permission: "view_reports", isGranted: true },

      // Interviewer permissions
      { role: "interviewer", permission: "view_jobs", isGranted: true },
      { role: "interviewer", permission: "view_companies", isGranted: true },
      { role: "interviewer", permission: "view_applications", isGranted: true },
      { role: "interviewer", permission: "interview_candidates", isGranted: true },

      // Viewer permissions - read only
      { role: "viewer", permission: "view_jobs", isGranted: true },
      { role: "viewer", permission: "view_companies", isGranted: true },
      { role: "viewer", permission: "view_applications", isGranted: true },
      { role: "viewer", permission: "view_reports", isGranted: true },
    ];

    // Insert permissions in batch
    if (defaultPermissions.length > 0) {
      await db
        .insert(rolePermissions)
        .values(defaultPermissions as any);
    }
  }

  async checkUserPermission(userId: string, companyId: string, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId, companyId);
    return userPermissions.includes(permission);
  }
}

export const storage = new DatabaseStorage();
