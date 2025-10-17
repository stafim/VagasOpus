import { useQuery } from "@tanstack/react-query";
import type { 
  DashboardMetrics, 
  JobsByStatusResponse, 
  ApplicationsByMonthResponse, 
  JobsListResponse,
  OpenJobsByMonthResponse,
  JobsByCreatorResponse,
  JobsByCompanyResponse,
  JobsSLAResponse
} from "@shared/schema";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  BarChart,
  Bar,
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
  aberto: '#5B9FED',      // Azul claro
  aprovada: '#3B82F6',    // Azul médio
  em_recrutamento: '#60A5FA', // Azul sky
  em_documentacao: '#2563EB', // Azul royal
  dp: '#1E40AF',          // Azul escuro
  closed: '#10b981'       // Verde
};

const statusLabels: Record<string, string> = {
  aberto: "1. Abertas",
  aprovada: "2. Aprovadas",
  em_recrutamento: "3. Em Recrutamento",
  em_documentacao: "4. Em Documentação",
  dp: "5. DP",
  closed: "6. Fechadas"
};

export default function Dashboard() {
  const [showJobModal, setShowJobModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  
  // Gerar lista dos últimos 12 meses
  const getMonthOptions = () => {
    const months = [{ value: "all", label: "Todos os períodos" }];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7); // YYYY-MM
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      months.push({ 
        value, 
        label: label.charAt(0).toUpperCase() + label.slice(1) 
      });
    }
    
    return months;
  };

  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics", selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedMonth !== "all") params.append("month", selectedMonth);
      const res = await fetch(`/api/dashboard/metrics?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return await res.json();
    }
  });

  const { data: jobsByStatus, isLoading: jobsByStatusLoading } = useQuery<JobsByStatusResponse>({
    queryKey: ["/api/dashboard/jobs-by-status", selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedMonth !== "all") params.append("month", selectedMonth);
      const res = await fetch(`/api/dashboard/jobs-by-status?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs by status');
      return await res.json();
    }
  });

  const { data: applicationsByMonth, isLoading: applicationsByMonthLoading } = useQuery<ApplicationsByMonthResponse>({
    queryKey: ["/api/dashboard/applications-by-month"],
  });

  const { data: openJobsByMonth, isLoading: openJobsByMonthLoading } = useQuery<OpenJobsByMonthResponse>({
    queryKey: ["/api/dashboard/open-jobs-by-month"],
  });

  const { data: jobsByCreator, isLoading: jobsByCreatorLoading } = useQuery<JobsByCreatorResponse>({
    queryKey: ["/api/dashboard/jobs-by-creator", selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedMonth !== "all") params.append("month", selectedMonth);
      const res = await fetch(`/api/dashboard/jobs-by-creator?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs by creator');
      return await res.json();
    }
  });

  const { data: jobsByCompany, isLoading: jobsByCompanyLoading } = useQuery<JobsByCompanyResponse>({
    queryKey: ["/api/dashboard/jobs-by-company", selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedMonth !== "all") params.append("month", selectedMonth);
      const res = await fetch(`/api/dashboard/jobs-by-company?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs by company');
      return await res.json();
    }
  });

  const { data: jobsSLA, isLoading: jobsSLALoading } = useQuery<JobsSLAResponse>({
    queryKey: ["/api/dashboard/jobs-sla", selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedMonth !== "all") params.append("month", selectedMonth);
      const res = await fetch(`/api/dashboard/jobs-sla?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch jobs SLA');
      return await res.json();
    }
  });

  const { data: allJobsByCreator, isLoading: allJobsByCreatorLoading } = useQuery<JobsByCreatorResponse>({
    queryKey: ["/api/dashboard/all-jobs-by-creator", selectedMonth],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedMonth !== "all") params.append("month", selectedMonth);
      const res = await fetch(`/api/dashboard/all-jobs-by-creator?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch all jobs by creator');
      return await res.json();
    }
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<JobsListResponse>({
    queryKey: ["/api/jobs", search],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "10",
        offset: "0",
        ...(search && { search })
      });
      const res = await fetch(`/api/jobs?${params}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return await res.json();
    }
  });

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    closed: "default",
    aberto: "default",
    aprovada: "default",
    em_recrutamento: "outline",
    em_documentacao: "secondary"
  };

  const formatSalary = (min?: string, max?: string) => {
    if (!min && !max) return "Não informado";
    if (!min) return `Até R$ ${parseFloat(max!).toLocaleString()}`;
    if (!max) return `R$ ${parseFloat(min).toLocaleString()}`;
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
        {/* Filtros */}
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">Período de Análise</h3>
                  <p className="text-xs text-muted-foreground">Filtrar dados por mês</p>
                </div>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[240px]" data-testid="select-month-filter">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {getMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Card */}
        <div className="grid grid-cols-1 gap-6">
          {metricsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <MetricsCard
              title="Vagas abertas no mês"
              value={metrics?.totalJobs || 0}
              icon={Briefcase}
              iconBgColor="bg-primary/10"
              iconColor="text-primary"
              description="Vagas abertas no período selecionado"
              trend={{ value: "+12%", isPositive: true }}
            />
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-2 rounded-full"></div>
                Vagas e SLA
              </CardTitle>
              <CardDescription>Distribuição de vagas dentro e fora do prazo</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsSLALoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="flex items-center justify-around h-64">
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2" style={{ color: '#3B82F6' }}>
                      {jobsSLA?.withinSLA || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Dentro do SLA
                    </div>
                  </div>
                  <div className="h-32 w-px bg-border"></div>
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2" style={{ color: '#1D4ED8' }}>
                      {jobsSLA?.outsideSLA || 0}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Fora do SLA
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-3 rounded-full"></div>
                Vagas em Recrutamento por Usuário
              </CardTitle>
              <CardDescription>Top 5 usuários com mais vagas em recrutamento</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsByCreatorLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={jobsByCreator?.slice(0, 5).map((item) => ({
                        name: item.creatorName,
                        value: item.count
                      })) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="hsl(var(--chart-3))"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {jobsByCreator?.slice(0, 5).map((_, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#3B82F6', '#60A5FA', '#2563EB', '#10b981', '#5B9FED'][index % 5]} />
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

          <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                Vagas Abertas por Empresa
              </CardTitle>
              <CardDescription>Top 5 empresas com mais vagas abertas</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsByCompanyLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={jobsByCompany?.slice(0, 5).map((item) => ({
                        name: item.companyName,
                        value: item.count
                      })) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="hsl(var(--chart-4))"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {jobsByCompany?.slice(0, 5).map((_, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#10b981', '#3B82F6', '#5B9FED', '#60A5FA', '#2563EB'][index % 5]} />
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
        </div>

        {/* Vagas por Solicitante */}
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              Vagas por Solicitante (Gestor)
            </CardTitle>
            <CardDescription>Quantidade de vagas criadas por cada gestor solicitante</CardDescription>
          </CardHeader>
          <CardContent>
            {allJobsByCreatorLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart 
                  data={allJobsByCreator?.slice(0, 10).map((item) => ({
                    name: item.creatorName,
                    value: item.count
                  })) || []} 
                  layout="horizontal"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={25} />
                </BarChart>
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
                          {job.status === "closed" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white border border-green-600">
                              {statusLabels[job.status] || job.status}
                            </span>
                          ) : (
                            <Badge variant={statusVariants[job.status] || "secondary"}>
                              {statusLabels[job.status] || job.status}
                            </Badge>
                          )}
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
