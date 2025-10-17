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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { 
  Briefcase, 
  CheckCircle, 
  UserPlus,
  Users, 
  Building2, 
  Search,
  Eye,
  Calendar
} from "lucide-react";

const statusColors: Record<string, string> = {
  aberto: '#3b82f6',           // Azul
  aprovada: '#10b981',          // Verde
  em_recrutamento: '#f59e0b',   // Laranja
  em_documentacao: '#8b5cf6',   // Roxo
  closed: '#ef4444',            // Vermelho
};

const statusLabels: Record<string, string> = {
  closed: "Fechada",
  aberto: "Aberto",
  aprovada: "Aprovada",
  em_recrutamento: "Em Recrutamento",
  em_documentacao: "Em Documentação"
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
    closed: "destructive",
    aberto: "default",
    aprovada: "default",
    em_recrutamento: "outline",
    em_documentacao: "secondary"
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {metricsLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : (
            <>
              <MetricsCard
                title="Vagas Totais"
                value={metrics?.totalJobs || 0}
                icon={Briefcase}
                iconBgColor="bg-primary/10"
                iconColor="text-primary"
                description="Todas as vagas cadastradas"
                trend={{ value: "+12%", isPositive: true }}
              />
              <MetricsCard
                title="Vagas Ativas"
                value={metrics?.activeJobs || 0}
                icon={CheckCircle}
                iconBgColor="bg-success/10"
                iconColor="text-success"
                description="Vagas abertas para candidatura"
                trend={{ value: "+8%", isPositive: true }}
              />
            </>
          )}
        </div>

        {/* Charts Section */}
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Vagas por Status
            </CardTitle>
            <CardDescription>Distribuição das vagas por situação atual</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsByStatusLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
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
                    outerRadius={90}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                  >
                    {jobsByStatus?.map((entry, index: number) => (
                      <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#6b7280'} />
                    )) || []}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Jobs Table */}
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                  Vagas Recentes
                </CardTitle>
                <CardDescription>Últimas vagas cadastradas no sistema</CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    placeholder="Buscar vagas..."
                    className="pl-10 w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-search-jobs"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">

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
                              <Eye className="h-4 w-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Users className="h-4 w-4 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground text-center">
                          <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p>Nenhuma vaga encontrada</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          </CardContent>
        </Card>
      </div>

      <JobModal
        isOpen={showJobModal}
        onClose={() => setShowJobModal(false)}
      />
    </>
  );
}
