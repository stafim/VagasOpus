import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics, JobsByStatusResponse, ApplicationsByMonthResponse, JobsListResponse, CompaniesListResponse } from "@shared/schema";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const statusLabels: Record<string, string> = {
  active: "Ativa",
  draft: "Rascunho",
  paused: "Pausada",
  closed: "Fechada", 
  expired: "Expirada"
};

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

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
    queryKey: ["/api/jobs", { limit: 100, offset: 0 }],
  });

  const { data: companies, isLoading: companiesLoading } = useQuery<CompaniesListResponse>({
    queryKey: ["/api/companies"],
  });

  const exportReport = (type: string) => {
    // TODO: Implement report export functionality
    console.log(`Exporting ${type} report`);
  };

  const generatePDF = () => {
    window.print();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatSalary = (min?: string, max?: string) => {
    if (!min && !max) return "Não informado";
    if (!min) return `Até R$ ${parseFloat(max!).toLocaleString()}`;
    if (!max) return `A partir de R$ ${parseFloat(min).toLocaleString()}`;
    return `R$ ${parseFloat(min).toLocaleString()} - ${parseFloat(max).toLocaleString()}`;
  };

  return (
    <>
      <TopBar title="Relatórios" />
      
      <div className="space-y-6">
        {/* Filters and Export Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-filter mr-2 text-primary"></i>
              Filtros e Configurações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end justify-between">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Período
                  </label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger data-testid="select-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 90 dias</SelectItem>
                      <SelectItem value="365">Último ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Empresa
                  </label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger data-testid="select-company">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as empresas</SelectItem>
                      {companies?.map((company: any) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="active">Ativas</SelectItem>
                      <SelectItem value="closed">Fechadas</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={generatePDF}
                  data-testid="button-export-pdf"
                >
                  <i className="fas fa-file-pdf mr-2"></i>
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportReport('excel')}
                  data-testid="button-export-excel"
                >
                  <i className="fas fa-file-excel mr-2"></i>
                  Excel
                </Button>
                <Button 
                  onClick={() => exportReport('csv')}
                  data-testid="button-export-csv"
                >
                  <i className="fas fa-download mr-2"></i>
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">
              Relatório de Vagas
            </TabsTrigger>
            <TabsTrigger value="performance" data-testid="tab-performance">
              Desempenho
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metricsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))
              ) : (
                <>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {metrics?.totalJobs || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Vagas Totais</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <i className="fas fa-briefcase text-primary text-lg"></i>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {metrics?.activeJobs || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Vagas Ativas</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-check-circle text-green-600 text-lg"></i>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {metrics?.totalApplications || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Candidaturas</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-user-plus text-blue-600 text-lg"></i>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {metrics?.totalCompanies || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Empresas</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <i className="fas fa-building text-orange-600 text-lg"></i>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {jobsByStatusLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={jobsByStatus?.map((item: any) => ({
                            name: statusLabels[item.status] || item.status,
                            value: item.count
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          dataKey="value"
                        >
                          {jobsByStatus?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Candidaturas ao Longo do Tempo</CardTitle>
                </CardHeader>
                <CardContent>
                  {applicationsByMonthLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={applicationsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Detalhado de Vagas</CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Candidaturas</TableHead>
                          <TableHead>Faixa Salarial</TableHead>
                          <TableHead>Data de Criação</TableHead>
                          <TableHead>Dias Ativa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs?.map((job: any) => {
                          const createdDate = new Date(job.createdAt);
                          const daysActive = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
                          
                          return (
                            <TableRow key={job.id} data-testid={`row-report-job-${job.id}`}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.company?.name || "N/A"}</TableCell>
                              <TableCell>
                                <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                                  {statusLabels[job.status] || job.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{job.applicationsCount || 0}</TableCell>
                              <TableCell className="text-sm">
                                {formatSalary(job.salaryMin, job.salaryMax)}
                              </TableCell>
                              <TableCell>{formatDate(job.createdAt)}</TableCell>
                              <TableCell>{daysActive} dias</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">78.5%</div>
                    <p className="text-sm text-muted-foreground">
                      Vagas preenchidas com sucesso
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tempo Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">24 dias</div>
                    <p className="text-sm text-muted-foreground">
                      Para preenchimento de vagas
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custo Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">R$ 1.850</div>
                    <p className="text-sm text-muted-foreground">
                      Por contratação realizada
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance por Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                {companiesLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <div className="space-y-4">
                    {companies?.map((company: any) => (
                      <div key={company.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <i className="fas fa-building text-primary"></i>
                          </div>
                          <div>
                            <p className="font-medium">{company.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {company.jobsCount || 0} vagas ativas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">85%</p>
                          <p className="text-xs text-muted-foreground">Taxa de sucesso</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Tendências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Crescimento em vagas ativas</span>
                      <span className="text-sm font-bold text-green-600">+15.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Aumento em candidaturas</span>
                      <span className="text-sm font-bold text-blue-600">+23.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Redução no tempo de contratação</span>
                      <span className="text-sm font-bold text-primary">-8.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Melhoria na qualidade dos candidatos</span>
                      <span className="text-sm font-bold text-purple-600">+12.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Previsões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Próximo Mês
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Previsão de 25% mais candidaturas baseado na tendência atual
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        Trimestre
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Expectativa de redução de 15% no tempo médio de contratação
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                        Semestre
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Projeção de 40% de crescimento no número de vagas ativas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
