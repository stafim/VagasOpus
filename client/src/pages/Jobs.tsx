import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { JobsListResponse } from "@shared/schema";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import JobModal from "@/components/JobModal";
import JobStatusSelect from "@/components/JobStatusSelect";
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
import { JOB_STATUS_CONFIG, getStatusLabel } from "@shared/constants";
import {
  Search,
  Filter,
  Download,
  MapPin,
  Edit,
  Users,
  User,
  Copy,
  Trash2,
  Briefcase,
  Plus,
  LayoutDashboard
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const statusLabels: Record<string, string> = {
  closed: "Fechada",
  aberto: "Aberto",
  em_recrutamento: "Em Recrutamento",
  em_documentacao: "Em Documentação"
};

// Calculate SLA progress
const calculateSLA = (createdAt: string, slaDeadline: string) => {
  const created = new Date(createdAt);
  const deadline = new Date(slaDeadline);
  const now = new Date();
  
  const totalDays = 14; // SLA é de 14 dias
  const daysPassed = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  const percentage = Math.min((daysPassed / totalDays) * 100, 100);
  
  return {
    daysPassed,
    totalDays,
    percentage: Math.round(percentage),
    isOverdue: now > deadline
  };
};

export default function Jobs() {
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | undefined>();
  const [deletingJobId, setDeletingJobId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [professionFilter, setProfessionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch companies for filter
  const { data: companies } = useQuery<any[]>({
    queryKey: ["/api/companies"],
  });

  // Fetch professions for filter
  const { data: professions } = useQuery<any[]>({
    queryKey: ["/api/professions"],
  });

  const { data: jobs, isLoading } = useQuery<JobsListResponse>({
    queryKey: ["/api/jobs", { limit: pageSize, offset: currentPage * pageSize, search, statusFilter, companyFilter, professionFilter }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set('limit', pageSize.toString());
      queryParams.set('offset', (currentPage * pageSize).toString());
      if (search.trim()) {
        queryParams.set('search', search.trim());
      }
      if (statusFilter && statusFilter !== 'all') {
        queryParams.set('status', statusFilter);
      }
      if (companyFilter && companyFilter !== 'all') {
        queryParams.set('companyId', companyFilter);
      }
      if (professionFilter && professionFilter !== 'all') {
        queryParams.set('professionId', professionFilter);
      }
      const queryString = queryParams.toString();
      const jobsUrl = `/api/jobs${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(jobsUrl, { credentials: "include" });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Vaga excluída com sucesso!",
      });
      setDeletingJobId(undefined);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const assignRecruiterMutation = useMutation({
    mutationFn: async ({ jobId, userId }: { jobId: string; userId: string }) => {
      const response = await apiRequest("PUT", `/api/jobs/${jobId}`, { recruiterId: userId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.refetchQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Sucesso",
        description: "Vaga atribuída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atribuir vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    closed: "destructive"
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

  const handleEditJob = (jobId: string) => {
    setEditingJobId(jobId);
    setShowJobModal(true);
  };

  const handleCloseModal = () => {
    setShowJobModal(false);
    setEditingJobId(undefined);
  };

  const handleDeleteJob = (jobId: string) => {
    deleteJobMutation.mutate(jobId);
  };

  const handleAssignToMe = (jobId: string) => {
    if (user?.id) {
      assignRecruiterMutation.mutate({ jobId, userId: user.id });
    }
  };

  const handleGoToKanban = (jobId: string) => {
    setLocation(`/kanban?jobId=${jobId}`);
  };

  return (
    <>
      <TopBar
        title="Gerenciar Vagas"
        showCreateButton
        onCreateClick={() => setShowJobModal(true)}
        createButtonText="Nova Vaga"
      />

      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Buscar vagas por profissão..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                data-testid="button-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    {Object.keys(JOB_STATUS_CONFIG).map((status) => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Empresa</label>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger data-testid="select-company-filter">
                    <SelectValue placeholder="Todas as empresas" />
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
                <label className="block text-sm font-medium mb-2">Profissão</label>
                <Select value={professionFilter} onValueChange={setProfessionFilter}>
                  <SelectTrigger data-testid="select-profession-filter">
                    <SelectValue placeholder="Todas as profissões" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as profissões</SelectItem>
                    {professions?.map((profession: any) => (
                      <SelectItem key={profession.id} value={profession.id}>
                        {profession.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setStatusFilter("all");
                  setCompanyFilter("all");
                  setProfessionFilter("all");
                }}
                data-testid="button-clear-filters"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}

        {/* Jobs Table */}
        <div className="bg-card rounded-lg border border-border shadow-sm">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Vaga</TableHead>
                    <TableHead>Profissão</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Candidatos</TableHead>
                    <TableHead>Salário</TableHead>
                    <TableHead>SLA (14 dias)</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs && jobs.length > 0 ? (
                    jobs.map((job: any) => (
                      <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                        <TableCell>
                          <div className="font-bold text-primary" data-testid={`text-job-code-${job.id}`}>
                            {job.jobCode || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-foreground">
                              {job.profession?.name || job.title || "Profissão não definida"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {job.profession?.category || ""}
                            </div>
                            {job.location && (
                              <div className="text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3 mr-1" />
                                {job.location}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {job.company?.name || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <JobStatusSelect
                            jobId={job.id}
                            currentStatus={job.status}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {job.applicationsCount || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.slaDeadline ? (
                            (() => {
                              const sla = calculateSLA(job.createdAt, job.slaDeadline);
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium" style={{ color: sla.isOverdue ? '#ef4444' : sla.percentage > 80 ? '#f59e0b' : '#10b981' }}>
                                      {sla.percentage}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      ({sla.daysPassed}/{sla.totalDays} dias)
                                    </div>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="h-1.5 rounded-full transition-all"
                                      style={{ 
                                        width: `${sla.percentage}%`,
                                        backgroundColor: sla.isOverdue ? '#ef4444' : sla.percentage > 80 ? '#f59e0b' : '#10b981'
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(job.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditJob(job.id)}
                              data-testid={`button-edit-${job.id}`}
                            >
                              <Edit className="h-4 w-4 text-primary" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAssignToMe(job.id)}
                              title="Assumir esta vaga"
                              data-testid={`button-assign-${job.id}`}
                            >
                              <Users className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleGoToKanban(job.id)}
                              title="Ver Kanban desta vaga"
                              data-testid={`button-kanban-${job.id}`}
                            >
                              <LayoutDashboard className="h-4 w-4 text-purple-600" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingJobId(job.id)}
                              data-testid={`button-delete-${job.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="text-muted-foreground">
                          <Briefcase className="h-16 w-16 mb-4" />
                          <p className="text-lg font-medium mb-2">Nenhuma vaga encontrada</p>
                          <p className="text-sm">
                            {search
                              ? "Tente ajustar os filtros de busca"
                              : "Comece criando sua primeira vaga"}
                          </p>
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

      {/* Job Modal */}
      <JobModal
        isOpen={showJobModal}
        onClose={handleCloseModal}
        jobId={editingJobId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingJobId} onOpenChange={() => setDeletingJobId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.
              Todas as candidaturas relacionadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingJobId && handleDeleteJob(deletingJobId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Excluir Vaga
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
