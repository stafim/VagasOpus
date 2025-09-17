import {
  users,
  companies,
  costCenters,
  jobs,
  applications,
  userCompanyRoles,
  rolePermissions,
  type User,
  type UpsertUser,
  type InsertUser,
  type Company,
  type InsertCompany,
  type CostCenter,
  type InsertCostCenter,
  type Job,
  type InsertJob,
  type JobWithDetails,
  type CompanyWithCostCenters,
  type Application,
  type InsertApplication,
  type UserCompanyRole,
  type InsertUserCompanyRole,
  type RolePermission,
  type InsertRolePermission,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  
  // Job operations
  getJobs(limit?: number, offset?: number, search?: string): Promise<JobWithDetails[]>;
  getJob(id: string): Promise<JobWithDetails | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  
  // Application operations
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: string, status: string): Promise<Application>;
  
  // Analytics operations
  getDashboardMetrics(): Promise<{
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    totalCompanies: number;
  }>;
  
  getJobsByStatus(): Promise<Array<{ status: string; count: number }>>;
  getApplicationsByMonth(): Promise<Array<{ month: string; count: number }>>;
  
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

  // Job operations
  async getJobs(limit = 50, offset = 0, search?: string): Promise<JobWithDetails[]> {
    let baseQuery = db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        requirements: jobs.requirements,
        companyId: jobs.companyId,
        costCenterId: jobs.costCenterId,
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
        company: {
          id: companies.id,
          name: companies.name,
          description: companies.description,
          website: companies.website,
          logo: companies.logo,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
        },
        applicationsCount: count(applications.id),
      })
      .from(jobs)
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(applications, eq(jobs.id, applications.jobId))
      .groupBy(jobs.id, companies.id);

    if (search) {
      baseQuery = baseQuery.where(
        ilike(jobs.title, `%${search}%`)
      );
    }

    const result = await baseQuery
      .orderBy(desc(jobs.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row,
      company: row.company?.id ? row.company : undefined,
    }));
  }

  async getJob(id: string): Promise<JobWithDetails | undefined> {
    const [job] = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        requirements: jobs.requirements,
        companyId: jobs.companyId,
        costCenterId: jobs.costCenterId,
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
        company: {
          id: companies.id,
          name: companies.name,
          description: companies.description,
          website: companies.website,
          logo: companies.logo,
          createdAt: companies.createdAt,
          updatedAt: companies.updatedAt,
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
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(costCenters, eq(jobs.costCenterId, costCenters.id))
      .where(eq(jobs.id, id));

    if (!job) return undefined;

    const jobApplications = await this.getApplicationsByJob(id);

    return {
      ...job,
      company: job.company?.id ? job.company : undefined,
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
