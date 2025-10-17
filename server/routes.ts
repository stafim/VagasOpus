import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { 
  insertCompanySchema, 
  insertCostCenterSchema,
  insertClientSchema,
  insertJobSchema,
  insertCandidateSchema,
  insertApplicationSchema,
  insertUserCompanyRoleSchema,
  insertSelectionStageSchema,
  insertInterviewSchema,
  insertInterviewCriteriaSchema,
  insertApplicationStageProgressSchema
} from "@shared/schema";
import { z } from "zod";

// Authorization middleware
const requirePermission = (permission: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.session?.user?.id;
      const companyId = req.body.companyId || req.params.companyId;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, companyId, permission);
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({ message: "Authorization check failed" });
    }
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - setup simple auth to provide authentication
  setupSimpleAuth(app);

  // Dashboard metrics
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get('/api/dashboard/jobs-by-status', isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getJobsByStatus();
      res.json(data);
    } catch (error) {
      console.error("Error fetching jobs by status:", error);
      res.status(500).json({ message: "Failed to fetch jobs by status" });
    }
  });

  app.get('/api/dashboard/applications-by-month', isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getApplicationsByMonth();
      res.json(data);
    } catch (error) {
      console.error("Error fetching applications by month:", error);
      res.status(500).json({ message: "Failed to fetch applications by month" });
    }
  });

  app.get('/api/reports/job-closure', isAuthenticated, async (req, res) => {
    try {
      const report = await storage.getJobClosureReport();
      res.json(report);
    } catch (error) {
      console.error("Error fetching job closure report:", error);
      res.status(500).json({ message: "Failed to fetch job closure report" });
    }
  });

  // Profession routes
  app.get('/api/professions', isAuthenticated, async (req, res) => {
    try {
      const professions = await storage.getProfessions();
      res.json(professions);
    } catch (error) {
      console.error("Error fetching professions:", error);
      res.status(500).json({ message: "Failed to fetch professions" });
    }
  });

  // Recruiters endpoint
  app.get('/api/recruiters', isAuthenticated, async (req, res) => {
    try {
      const recruiters = await storage.getRecruiters();
      res.json(recruiters);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
      res.status(500).json({ message: "Failed to fetch recruiters" });
    }
  });

  // Users routes
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      // Create user with default password hash (should be changed on first login)
      const bcrypt = await import('bcrypt');
      const defaultPasswordHash = await bcrypt.hash('changeme123', 10);
      
      const newUser = await storage.createUser({
        email: userData.email,
        passwordHash: defaultPasswordHash,
        firstName: userData.name,
        lastName: userData.name, // Using name for both first and last
        role: userData.role || 'user'
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get('/api/professions/categories/:category', isAuthenticated, async (req, res) => {
    try {
      const { category } = req.params;
      const professions = await storage.getProfessionsByCategory(category);
      res.json(professions);
    } catch (error) {
      console.error("Error fetching professions by category:", error);
      res.status(500).json({ message: "Failed to fetch professions by category" });
    }
  });

  app.get('/api/professions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const profession = await storage.getProfession(id);
      if (!profession) {
        return res.status(404).json({ message: "Profession not found" });
      }
      res.json(profession);
    } catch (error) {
      console.error("Error fetching profession:", error);
      res.status(500).json({ message: "Failed to fetch profession" });
    }
  });

  // Work Scale routes
  app.get('/api/work-scales', isAuthenticated, async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const workScales = await storage.getWorkScales(includeInactive);
      res.json(workScales);
    } catch (error) {
      console.error("Error fetching work scales:", error);
      res.status(500).json({ message: "Failed to fetch work scales" });
    }
  });

  app.get('/api/work-scales/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const workScale = await storage.getWorkScale(id);
      if (!workScale) {
        return res.status(404).json({ message: "Work scale not found" });
      }
      res.json(workScale);
    } catch (error) {
      console.error("Error fetching work scale:", error);
      res.status(500).json({ message: "Failed to fetch work scale" });
    }
  });

  app.post('/api/work-scales', isAuthenticated, async (req, res) => {
    try {
      const workScale = await storage.createWorkScale(req.body);
      res.status(201).json(workScale);
    } catch (error) {
      console.error("Error creating work scale:", error);
      res.status(500).json({ message: "Failed to create work scale" });
    }
  });

  app.put('/api/work-scales/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const workScale = await storage.updateWorkScale(id, req.body);
      res.json(workScale);
    } catch (error) {
      console.error("Error updating work scale:", error);
      res.status(500).json({ message: "Failed to update work scale" });
    }
  });

  app.delete('/api/work-scales/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkScale(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting work scale:", error);
      res.status(500).json({ message: "Failed to delete work scale" });
    }
  });

  // Benefit routes
  app.get('/api/benefits', isAuthenticated, async (req, res) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const benefits = await storage.getBenefits(includeInactive);
      res.json(benefits);
    } catch (error) {
      console.error("Error fetching benefits:", error);
      res.status(500).json({ message: "Failed to fetch benefits" });
    }
  });

  app.get('/api/benefits/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const benefit = await storage.getBenefit(id);
      if (!benefit) {
        return res.status(404).json({ message: "Benefit not found" });
      }
      res.json(benefit);
    } catch (error) {
      console.error("Error fetching benefit:", error);
      res.status(500).json({ message: "Failed to fetch benefit" });
    }
  });

  app.post('/api/benefits', isAuthenticated, async (req, res) => {
    try {
      const benefit = await storage.createBenefit(req.body);
      res.status(201).json(benefit);
    } catch (error) {
      console.error("Error creating benefit:", error);
      res.status(500).json({ message: "Failed to create benefit" });
    }
  });

  app.put('/api/benefits/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const benefit = await storage.updateBenefit(id, req.body);
      res.json(benefit);
    } catch (error) {
      console.error("Error updating benefit:", error);
      res.status(500).json({ message: "Failed to update benefit" });
    }
  });

  app.delete('/api/benefits/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBenefit(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting benefit:", error);
      res.status(500).json({ message: "Failed to delete benefit" });
    }
  });

  // Company routes
  app.get('/api/companies', isAuthenticated, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post('/api/companies', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  app.put('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Check if user has permission to edit this company
      const hasPermission = await storage.checkUserPermission(userId, id, 'edit_companies');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(id, validatedData);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(400).json({ message: "Invalid company data" });
    }
  });

  app.delete('/api/companies/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Check if user has permission to delete this company
      const hasPermission = await storage.checkUserPermission(userId, id, 'delete_companies');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      await storage.deleteCompany(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Cost Center routes
  app.get('/api/companies/:companyId/cost-centers', isAuthenticated, async (req, res) => {
    try {
      const { companyId } = req.params;
      const costCenters = await storage.getCostCentersByCompany(companyId);
      res.json(costCenters);
    } catch (error) {
      console.error("Error fetching cost centers:", error);
      res.status(500).json({ message: "Failed to fetch cost centers" });
    }
  });

  app.post('/api/cost-centers', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCostCenterSchema.parse(req.body);
      const costCenter = await storage.createCostCenter(validatedData);
      res.status(201).json(costCenter);
    } catch (error) {
      console.error("Error creating cost center:", error);
      res.status(400).json({ message: "Invalid cost center data" });
    }
  });

  app.put('/api/cost-centers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCostCenterSchema.partial().parse(req.body);
      const costCenter = await storage.updateCostCenter(id, validatedData);
      res.json(costCenter);
    } catch (error) {
      console.error("Error updating cost center:", error);
      res.status(400).json({ message: "Invalid cost center data" });
    }
  });

  app.delete('/api/cost-centers/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCostCenter(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting cost center:", error);
      res.status(500).json({ message: "Failed to delete cost center" });
    }
  });

  // Client Routes
  app.get('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post('/api/clients', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, validatedData);
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete('/api/clients/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteClient(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Job routes
  app.get('/api/jobs', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const companyId = req.query.companyId as string;
      const professionId = req.query.professionId as string;
      
      let jobs = await storage.getJobs(limit, offset, search, status, companyId, professionId);
      
      // Filter jobs based on user role
      const user = req.session?.user;
      if (user && user.role === 'recruiter') {
        // Recruiters cannot see jobs with status "aprovada" or "aberto"
        jobs = jobs.filter((job: any) => 
          job.status !== 'aprovada' && job.status !== 'aberto'
        );
      }
      
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.id || (req.session as any).user?.id;
      
      console.log("=== DEBUG JOB CREATION ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      // Calculate SLA deadline (14 days from now)
      const slaDeadline = new Date();
      slaDeadline.setDate(slaDeadline.getDate() + 14);
      
      // Clean the data - remove empty strings and convert to proper types
      const cleanedBody = Object.fromEntries(
        Object.entries(req.body).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      );
      
      console.log("Cleaned body:", JSON.stringify(cleanedBody, null, 2));
      
      // Don't set createdBy in AUTH_BYPASS mode since the user doesn't exist in DB
      const dataToValidate: any = {
        ...cleanedBody,
        slaDeadline: slaDeadline.toISOString(),
      };
      
      // Only set createdBy if not in bypass mode and user exists
      if (process.env.AUTH_BYPASS !== 'true') {
        dataToValidate.createdBy = userId;
      }
      
      const validatedData = insertJobSchema.parse(dataToValidate);
      
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));
      
      // Convert ISO strings to Date objects for Drizzle timestamp columns
      const jobDataForDb: any = { ...validatedData };
      
      console.log("Before date conversion - slaDeadline type:", typeof jobDataForDb.slaDeadline, "value:", jobDataForDb.slaDeadline);
      
      if (jobDataForDb.openingDate) {
        console.log("Converting openingDate:", jobDataForDb.openingDate);
        jobDataForDb.openingDate = new Date(jobDataForDb.openingDate);
      }
      if (jobDataForDb.startDate) {
        console.log("Converting startDate:", jobDataForDb.startDate);
        jobDataForDb.startDate = new Date(jobDataForDb.startDate);
      }
      if (jobDataForDb.expiresAt) {
        console.log("Converting expiresAt:", jobDataForDb.expiresAt);
        jobDataForDb.expiresAt = new Date(jobDataForDb.expiresAt);
      }
      if (jobDataForDb.slaDeadline) {
        console.log("Converting slaDeadline:", jobDataForDb.slaDeadline);
        jobDataForDb.slaDeadline = new Date(jobDataForDb.slaDeadline);
        console.log("Converted slaDeadline to:", jobDataForDb.slaDeadline, "type:", typeof jobDataForDb.slaDeadline);
      }
      
      console.log("Date conversion complete. About to call storage.createJob");
      
      // Validate profession exists and is active  
      const profession = await storage.getProfession(validatedData.professionId);
      if (!profession || !profession.isActive) {
        return res.status(400).json({ message: "Invalid or inactive profession" });
      }
      
      // Require companyId for authorization
      if (!validatedData.companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      // Check permission for the specific company
      const hasPermission = await storage.checkUserPermission(userId, validatedData.companyId, 'create_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const job = await storage.createJob(jobDataForDb);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  app.put('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || (req.session as any).user?.id;
      
      // First load the job to get its actual companyId for authorization
      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check permission using the job's actual companyId
      if (!existingJob.companyId) {
        return res.status(400).json({ message: "Job has no associated company" });
      }
      const hasPermission = await storage.checkUserPermission(userId, existingJob.companyId, 'edit_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertJobSchema.partial().parse(req.body);
      
      // Validate profession exists and is active if being updated
      if (validatedData.professionId) {
        const profession = await storage.getProfession(validatedData.professionId);
        if (!profession || !profession.isActive) {
          return res.status(400).json({ message: "Invalid or inactive profession" });
        }
      }
      
      // Prevent changing companyId via update (security measure)
      delete validatedData.companyId;
      
      const job = await storage.updateJob(id, validatedData);
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  // Job status update endpoint
  app.patch('/api/jobs/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id || (req.session as any).user?.id;
      
      // Validate status
      const validStatuses = ["draft", "active", "paused", "closed", "expired", "aberto", "aprovada", "em_recrutamento", "em_documentacao"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status provided" });
      }
      
      // First load the job to get its actual companyId for authorization
      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check permission using the job's actual companyId
      if (!existingJob.companyId) {
        return res.status(400).json({ message: "Job has no associated company" });
      }
      const hasPermission = await storage.checkUserPermission(userId, existingJob.companyId, 'edit_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      // Update only the status
      const job = await storage.updateJob(id, { status });
      res.json(job);
    } catch (error) {
      console.error("Error updating job status:", error);
      res.status(500).json({ message: "Failed to update job status" });
    }
  });

  app.delete('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || (req.session as any).user?.id;
      
      // First load the job to get its actual companyId for authorization
      const existingJob = await storage.getJob(id);
      if (!existingJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check permission using the job's actual companyId
      if (!existingJob.companyId) {
        return res.status(400).json({ message: "Job has no associated company" });
      }
      const hasPermission = await storage.checkUserPermission(userId, existingJob.companyId, 'delete_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      await storage.deleteJob(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Candidate routes
  app.get('/api/candidates', isAuthenticated, async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.get('/api/candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const candidate = await storage.getCandidate(id);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error fetching candidate:", error);
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });

  app.post('/api/candidates', async (req, res) => {
    try {
      const validatedData = insertCandidateSchema.parse(req.body);
      const candidate = await storage.createCandidate(validatedData);
      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      res.status(400).json({ message: "Invalid candidate data" });
    }
  });

  app.patch('/api/candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const candidate = await storage.updateCandidate(id, req.body);
      res.json(candidate);
    } catch (error) {
      console.error("Error updating candidate:", error);
      res.status(500).json({ message: "Failed to update candidate" });
    }
  });

  app.delete('/api/candidates/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCandidate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting candidate:", error);
      res.status(500).json({ message: "Failed to delete candidate" });
    }
  });

  // Application routes
  app.get('/api/jobs/:jobId/applications', isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.params;
      const applications = await storage.getApplicationsByJob(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  app.get('/api/applications', isAuthenticated, async (req, res) => {
    try {
      const { jobId } = req.query;
      let applications;
      
      if (jobId && typeof jobId === 'string') {
        applications = await storage.getApplicationsByJob(jobId);
        // Also get candidate and job details for each application
        const detailedApplications = await storage.getApplicationsWithJobDetails();
        applications = detailedApplications.filter(app => app.jobId === jobId);
      } else {
        applications = await storage.getApplicationsWithJobDetails();
      }
      
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.patch('/api/applications/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const application = await storage.updateApplication(id, req.body);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.patch('/api/applications/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const application = await storage.updateApplicationStatus(id, status);
      res.json(application);
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Expanded Application routes
  app.get('/api/applications/:id/details', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      const application = await storage.getApplicationWithDetails(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if user has permission to view applications for this company
      const hasPermission = await storage.checkUserPermission(userId, application.job?.companyId!, 'view_applications');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error fetching application details:", error);
      res.status(500).json({ message: "Failed to fetch application details" });
    }
  });

  app.put('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get application to check company permission
      const existingApp = await storage.getApplicationWithDetails(id);
      if (!existingApp) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, existingApp.job?.companyId!, 'manage_applications');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const validatedData = insertApplicationSchema.partial().parse(req.body);
      const application = await storage.updateApplication(id, validatedData);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(400).json({ message: "Failed to update application" });
    }
  });

  // Selection Stages routes
  app.get('/api/jobs/:jobId/stages', isAuthenticated, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get job to check company permission
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, job.companyId!, 'view_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const stages = await storage.getSelectionStagesByJob(jobId);
      res.json(stages);
    } catch (error) {
      console.error("Error fetching selection stages:", error);
      res.status(500).json({ message: "Failed to fetch selection stages" });
    }
  });

  app.post('/api/selection-stages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const validatedData = insertSelectionStageSchema.parse(req.body);
      
      // Get job to check company permission
      const job = await storage.getJob(validatedData.jobId!);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, job.companyId!, 'edit_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const stage = await storage.createSelectionStage(validatedData);
      res.status(201).json(stage);
    } catch (error) {
      console.error("Error creating selection stage:", error);
      res.status(400).json({ message: "Invalid selection stage data" });
    }
  });

  app.put('/api/selection-stages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get existing stage to check permissions
      const stages = await storage.getSelectionStagesByJob("dummy"); // Need to get stage first to check job
      // Note: This could be improved with a getSelectionStage(id) method
      
      const validatedData = insertSelectionStageSchema.partial().parse(req.body);
      const stage = await storage.updateSelectionStage(id, validatedData);
      res.json(stage);
    } catch (error) {
      console.error("Error updating selection stage:", error);
      res.status(400).json({ message: "Failed to update selection stage" });
    }
  });

  app.delete('/api/selection-stages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      // Note: Should check permissions by getting stage and its job first
      await storage.deleteSelectionStage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting selection stage:", error);
      res.status(500).json({ message: "Failed to delete selection stage" });
    }
  });

  app.post('/api/jobs/:jobId/setup-default-stages', isAuthenticated, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get job to check company permission
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, job.companyId!, 'edit_jobs');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      await storage.setupDefaultSelectionStages(jobId);
      res.json({ message: "Default stages created successfully" });
    } catch (error) {
      console.error("Error setting up default stages:", error);
      res.status(500).json({ message: "Failed to setup default stages" });
    }
  });

  // Interview routes
  app.get('/api/applications/:applicationId/interviews', isAuthenticated, async (req: any, res) => {
    try {
      const { applicationId } = req.params;
      const userId = (req.session as any).user.id;
      
      // Get application to check company permission
      const application = await storage.getApplicationWithDetails(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const hasPermission = await storage.checkUserPermission(userId, application.job?.companyId!, 'view_applications');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      const interviews = await storage.getInterviewsByApplication(applicationId);
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  app.get('/api/interviews/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const interviewerId = req.query.interviewerId as string;
      
      const interviews = await storage.getUpcomingInterviews(interviewerId);
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching upcoming interviews:", error);
      res.status(500).json({ message: "Failed to fetch upcoming interviews" });
    }
  });

  app.get('/api/interviews/calendar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const interviewerId = req.query.interviewerId as string;
      
      const calendar = await storage.getInterviewCalendar(interviewerId);
      res.json(calendar);
    } catch (error) {
      console.error("Error fetching interview calendar:", error);
      res.status(500).json({ message: "Failed to fetch interview calendar" });
    }
  });

  app.post('/api/interviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const validatedData = insertInterviewSchema.parse(req.body);
      
      // Check if user can schedule interviews (interviewer role or manage_applications permission)
      const hasPermission = await storage.checkUserPermission(userId, "dummy", 'interview_candidates'); // Note: Need company context
      
      const interview = await storage.createInterview(validatedData);
      res.status(201).json(interview);
    } catch (error) {
      console.error("Error creating interview:", error);
      res.status(400).json({ message: "Invalid interview data" });
    }
  });

  app.get('/api/interviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      const interview = await storage.getInterviewWithDetails(id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      res.json(interview);
    } catch (error) {
      console.error("Error fetching interview:", error);
      res.status(500).json({ message: "Failed to fetch interview" });
    }
  });

  app.put('/api/interviews/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).user.id;
      
      const validatedData = insertInterviewSchema.partial().parse(req.body);
      const interview = await storage.updateInterview(id, validatedData);
      res.json(interview);
    } catch (error) {
      console.error("Error updating interview:", error);
      res.status(400).json({ message: "Failed to update interview" });
    }
  });

  // Application Stage Progress routes
  app.get('/api/applications/:applicationId/progress', isAuthenticated, async (req: any, res) => {
    try {
      const { applicationId } = req.params;
      const userId = (req.session as any).user.id;
      
      const progress = await storage.getApplicationProgress(applicationId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching application progress:", error);
      res.status(500).json({ message: "Failed to fetch application progress" });
    }
  });

  app.post('/api/applications/:applicationId/advance-stage', isAuthenticated, async (req: any, res) => {
    try {
      const { applicationId } = req.params;
      const { stageId, score, feedback } = req.body;
      const userId = (req.session as any).user.id;
      
      await storage.advanceApplicationStage(applicationId, stageId, score, feedback);
      res.json({ message: "Application stage advanced successfully" });
    } catch (error) {
      console.error("Error advancing application stage:", error);
      res.status(500).json({ message: "Failed to advance application stage" });
    }
  });

  // Selection Process Analytics routes
  app.get('/api/analytics/selection-process', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId as string;
      const timeframe = req.query.timeframe as string;
      
      const metrics = await storage.getSelectionProcessMetrics(companyId, timeframe);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching selection process metrics:", error);
      res.status(500).json({ message: "Failed to fetch selection process metrics" });
    }
  });

  app.get('/api/analytics/conversion-rates', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId as string;
      
      const conversionRates = await storage.getConversionRates(companyId);
      res.json(conversionRates);
    } catch (error) {
      console.error("Error fetching conversion rates:", error);
      res.status(500).json({ message: "Failed to fetch conversion rates" });
    }
  });

  app.get('/api/analytics/time-to-hire', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId as string;
      
      const avgTimeToHire = await storage.getAverageTimeToHire(companyId);
      res.json({ averageTimeToHire: avgTimeToHire });
    } catch (error) {
      console.error("Error fetching time to hire:", error);
      res.status(500).json({ message: "Failed to fetch time to hire" });
    }
  });

  // Permission routes
  app.get('/api/permissions/user-roles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const roles = await storage.getUserCompanyRoles(userId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  app.get('/api/permissions/:companyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const { companyId } = req.params;
      const permissions = await storage.getUserPermissions(userId, companyId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });

  app.post('/api/permissions/assign', isAuthenticated, requirePermission('manage_permissions'), async (req, res) => {
    try {
      const validatedData = insertUserCompanyRoleSchema.parse(req.body);
      const assignment = await storage.assignUserToCompany(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning user to company:", error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });

  app.put('/api/permissions/:id/role', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const userId = (req.session as any).user.id;
      
      // First get the assignment to verify company ownership
      const assignment = await storage.getUserCompanyRoleById(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if user has permission to manage roles in the assignment's company
      if (!assignment.companyId) {
        return res.status(400).json({ message: "Invalid assignment - missing company ID" });
      }
      const hasPermission = await storage.checkUserPermission(userId, assignment.companyId, 'manage_permissions');
      if (!hasPermission) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      
      // Validate role value
      const roleSchema = z.enum(['admin', 'hr_manager', 'recruiter', 'interviewer', 'viewer']);
      const validatedRole = roleSchema.parse(role);
      
      const updatedRole = await storage.updateUserCompanyRole(id, validatedRole);
      res.json(updatedRole);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/permissions/:userId/:companyId', isAuthenticated, requirePermission('manage_permissions'), async (req, res) => {
    try {
      const { userId, companyId } = req.params;
      await storage.removeUserFromCompany(userId, companyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing user from company:", error);
      res.status(500).json({ message: "Failed to remove user from company" });
    }
  });

  app.get('/api/permissions/roles/permissions', isAuthenticated, async (req, res) => {
    try {
      const permissions = await storage.getRolePermissions();
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post('/api/permissions/setup-defaults', isAuthenticated, async (req: any, res) => {
    try {
      // Only allow system admins to setup defaults (users with admin role globally)
      const userId = (req.session as any).user.id;
      const user = await storage.getUser(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Only system administrators can setup default permissions" });
      }
      
      await storage.setupDefaultRolePermissions();
      res.json({ message: "Default permissions setup completed" });
    } catch (error) {
      console.error("Error setting up default permissions:", error);
      res.status(500).json({ message: "Failed to setup default permissions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
