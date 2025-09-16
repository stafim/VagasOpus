import { useQuery } from "@tanstack/react-query";
import type { DashboardMetrics, JobsByStatusResponse, ApplicationsByMonthResponse } from "@shared/schema";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import MetricsCard from "@/components/MetricsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function Performance() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: jobsByStatus, isLoading: jobsByStatusLoading } = useQuery<JobsByStatusResponse>({
    queryKey: ["/api/dashboard/jobs-by-status"],
  });

  const { data: applicationsByMonth, isLoading: applicationsByMonthLoading } = useQuery<ApplicationsByMonthResponse>({
    queryKey: ["/api/dashboard/applications-by-month"],
  });

  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <>
      <TopBar title="Desempenho" />
      
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metricsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))
          ) : (
            <>
              <MetricsCard
                title="Taxa de Conversão"
                value="24.5%"
                icon="fas fa-chart-line"
                trend={{ value: "+2.1%", isPositive: true }}
                subtitle="vs. período anterior"
              />
              <MetricsCard
                title="Tempo Médio p/ Contratação"
                value="18 dias"
                icon="fas fa-clock"
                iconBgColor="bg-orange-100"
                iconColor="text-orange-600"
                trend={{ value: "-3 dias", isPositive: true }}
              />
              <MetricsCard
                title="Custo por Contratação"
                value="R$ 1.250"
                icon="fas fa-dollar-sign"
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
                trend={{ value: "-5.2%", isPositive: true }}
              />
              <MetricsCard
                title="Satisfação do Candidato"
                value="4.2/5"
                icon="fas fa-star"
                iconBgColor="bg-yellow-100"
                iconColor="text-yellow-600"
                trend={{ value: "+0.3", isPositive: true }}
              />
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Candidaturas</CardTitle>
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
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Candidaturas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Job Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Status das Vagas</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsByStatusLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={jobsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="count"
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
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-bullseye mr-2 text-primary"></i>
                Eficiência do Recrutamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Vagas preenchidas</span>
                <span className="text-lg font-bold text-green-600">78%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Dentro do prazo</span>
                <span className="text-lg font-bold text-blue-600">82%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-users mr-2 text-primary"></i>
                Qualidade dos Candidatos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">8.4</div>
                <p className="text-sm text-muted-foreground">Score médio de qualificação</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Perfil ideal</span>
                  <span className="text-sm font-medium">34%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Qualificado</span>
                  <span className="text-sm font-medium">52%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Em desenvolvimento</span>
                  <span className="text-sm font-medium">14%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-chart-bar mr-2 text-primary"></i>
                Métricas de Engajamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Taxa de resposta</span>
                  <span className="text-sm font-bold text-green-600">+15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tempo de resposta</span>
                  <span className="text-sm font-bold text-blue-600">2.3h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Abandono no processo</span>
                  <span className="text-sm font-bold text-orange-600">12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Net Promoter Score</span>
                  <span className="text-sm font-bold text-primary">72</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
              Insights e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-green-600 flex items-center">
                  <i className="fas fa-check-circle mr-2"></i>
                  Pontos Fortes
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <i className="fas fa-arrow-up text-green-500 mr-2 mt-1"></i>
                    Taxa de conversão 23% acima da média do setor
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-arrow-up text-green-500 mr-2 mt-1"></i>
                    Tempo médio de contratação reduziu em 18% este mês
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-arrow-up text-green-500 mr-2 mt-1"></i>
                    Alta satisfação dos candidatos (4.2/5)
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-orange-600 flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Oportunidades de Melhoria
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <i className="fas fa-arrow-down text-orange-500 mr-2 mt-1"></i>
                    Reduzir taxa de abandono no processo de candidatura
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-arrow-down text-orange-500 mr-2 mt-1"></i>
                    Melhorar tempo de resposta para candidatos
                  </li>
                  <li className="flex items-start">
                    <i className="fas fa-arrow-down text-orange-500 mr-2 mt-1"></i>
                    Aumentar diversidade nas contratações
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
