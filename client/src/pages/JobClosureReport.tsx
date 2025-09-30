import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Clock, DollarSign } from "lucide-react";
import type { JobClosureReportItem } from "@shared/schema";

export default function JobClosureReport() {
  const { data: reportData, isLoading } = useQuery<JobClosureReportItem[]>({
    queryKey: ["/api/reports/job-closure"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return "text-yellow-500";
      case 1:
        return "text-gray-400";
      case 2:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <>
      <TopBar title="Relatório de Fechamento de Vagas" />

      <div className="space-y-6">
        {/* Summary Cards */}
        {reportData && reportData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Total de Recrutadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total de Vagas Fechadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.reduce((acc, item) => acc + item.closedJobsCount, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempo Médio de Fechamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    reportData.reduce((acc, item) => acc + item.averageDaysToClose, 0) /
                      reportData.length
                  )}{" "}
                  dias
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Salário Médio Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    reportData.reduce((acc, item) => acc + item.averageSalary, 0) /
                      reportData.length
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ranking de Recrutadores por Vagas Fechadas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : reportData && reportData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Posição</TableHead>
                      <TableHead>Recrutador</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Vagas Fechadas</TableHead>
                      <TableHead className="text-center">Tempo Médio (dias)</TableHead>
                      <TableHead className="text-right">Salário Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.map((item, index) => (
                      <TableRow key={item.recruiterId} data-testid={`row-report-${item.recruiterId}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`text-xl ${getMedalColor(index)}`}>
                              {index < 3 ? <Trophy className="h-5 w-5" /> : `#${index + 1}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.recruiterName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {item.recruiterEmail}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className="font-semibold bg-green-600 hover:bg-green-700 text-white">
                            {item.closedJobsCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{item.averageDaysToClose}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">
                            {formatCurrency(item.averageSalary)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Nenhum dado disponível</p>
                <p className="text-sm text-muted-foreground">
                  Não há vagas fechadas para gerar o relatório
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
