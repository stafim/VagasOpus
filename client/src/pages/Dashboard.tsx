import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics, JobsByStatusResponse, ApplicationsByMonthResponse, JobsListResponse } from "@shared/schema";
import { useState } from "react";
import Layout from "@/components/Layout";
import MetricsCard from "@/components/MetricsCard";
import JobModal from "@/components/JobModal";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const statusLabels: Record<string, string> = {
  active: "Ativa",
  draft: "Rascunho", 
  paused: "Pausada",
  closed: "Fechada",
  expired: "Expirada"
};

export default function Dashboard() {
  const [showJobModal, setShowJobModal] = useState(false);
  const [search, setSearch] = useState("");

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: jobsByStatus, isLoading: jobsByStatusLoading } = useQuery<JobsByStatusResponse>({
    queryKey: ["/api/dashboard/jobs-by-status"],
  });

  const { data: applicationsByMonth, isLoading: applicationsByMonthLoading } = useQuery<ApplicationsByMonthResponse>({
    queryKey: ["/api/dashboard/applications-by-month"],
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<JobsListResponse>({
    queryKey: ["/api/jobs", { limit: 10, offset: 0, search }],
  });

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    draft: "secondary",
    paused: "outline",
    closed: "destructive",
    expired: "destructive"
  };

  const formatSalary = (min?: string, max?: string) => {
    if (!min && !max) return "Não informado";
    if (!min) return `Até R$ ${parseFloat(max!).toLocaleString()}`;
    if (!max) return `A partir de R$ ${parseFloat(min).toLocaleString()}`;
    return `R$ ${parseFloat(min).toLocaleString()} - ${parseFloat(max).toLocaleString()}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <>
      <TopBar
        title="Dashboard"
        showCreateButton
        onCreateClick={() => setShowJobModal(true)}
        createButtonText="Nova Vaga"
      />

      <div className="space-y-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metricsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : (
            <>
              <MetricsCard
                title="Vagas Totais"
                value={metrics?.totalJobs || 0}
                icon="fas fa-briefcase"
                trend={{ value: "+12%", isPositive: true }}
              />
              <MetricsCard
                title="Vagas Ativas"
                value={metrics?.activeJobs || 0}
                icon="fas fa-check-circle"
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
                trend={{ value: "+8%", isPositive: true }}
              />
              <MetricsCard
                title="Candidaturas"
                value={metrics?.totalApplications || 0}
                icon="fas fa-user-plus"
                iconBgColor="bg-amber-100"
                iconColor="text-amber-600"
                trend={{ value: "+23%", isPositive: true }}
              />
              <MetricsCard
                title="Empresas"
                value={metrics?.totalCompanies || 0}
                icon="fas fa-building"
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
                trend={{ value: "+3%", isPositive: true }}
              />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Vagas por Status</h3>
            </div>
            {jobsByStatusLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={jobsByStatus?.map((item) => ({
                      name: statusLabels[item.status] || item.status,
                      value: item.count
                    })) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {jobsByStatus?.map((entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    )) || []}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Candidaturas por Mês</h3>
            </div>
            {applicationsByMonthLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={applicationsByMonth?.map((item) => ({
                    month: item.month,
                    count: item.count
                  })) || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Jobs Table */}
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Vagas Recentes</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    placeholder="Buscar vagas..."
                    className="pl-10 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-search-jobs"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
                </div>
              </div>
            </div>
          </div>

          {jobsLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Candidatos</TableHead>
                    <TableHead>Salário</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(jobs) && jobs.length > 0 ? (
                    jobs.map((job: any) => (
                      <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground" data-testid={`text-job-title-${job.id}`}>
                              {job.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {job.department || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {job.company?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[job.status] || "secondary"}>
                            {statusLabels[job.status] || job.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2" data-testid={`text-applications-count-${job.id}`}>
                              {job.applicationsCount || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(job.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" data-testid={`button-edit-job-${job.id}`}>
                              <i className="fas fa-edit text-primary"></i>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-users text-green-600"></i>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-ellipsis-v text-muted-foreground"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          <i className="fas fa-briefcase text-4xl mb-4"></i>
                          <p>Nenhuma vaga encontrada</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <JobModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
      />
    </>
  );
}
