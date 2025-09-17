import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCompanySchema, 
  insertCostCenterSchema, 
  insertJobSchema, 
  insertApplicationSchema,
  insertUserCompanyRoleSchema 
} from "@shared/schema";
import { z } from "zod";

// Authorization middleware
const requirePermission = (permission: string) => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const companyId = req.body.companyId || req.params.companyId;
      
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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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

  app.post('/api/companies', isAuthenticated, requirePermission('create_companies'), async (req, res) => {
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
      const userId = (req as any).user.claims.sub;
      
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
      const userId = (req as any).user.claims.sub;
      
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

  // Job routes
  app.get('/api/jobs', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      
      const jobs = await storage.getJobs(limit, offset, search);
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
      const userId = req.user.claims.sub;
      const validatedData = insertJobSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  app.put('/api/jobs/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(id, validatedData);
      res.json(job);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(400).json({ message: "Invalid job data" });
    }
  });

  app.delete('/api/jobs/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteJob(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
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

  // Permission routes
  app.get('/api/permissions/user-roles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const roles = await storage.getUserCompanyRoles(userId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  app.get('/api/permissions/:companyId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = (req as any).user.claims.sub;
      
      // First get the assignment to verify company ownership
      const assignment = await storage.getUserCompanyRoleById(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if user has permission to manage roles in the assignment's company
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
      const userId = req.user.claims.sub;
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
