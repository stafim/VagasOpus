import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JobsListResponse } from "@shared/schema";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import JobModal from "@/components/JobModal";
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

const statusLabels: Record<string, string> = {
  active: "Ativa",
  draft: "Rascunho",
  paused: "Pausada", 
  closed: "Fechada",
  expired: "Expirada"
};

export default function Jobs() {
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | undefined>();
  const [deletingJobId, setDeletingJobId] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery<JobsListResponse>({
    queryKey: ["/api/jobs", { limit: pageSize, offset: currentPage * pageSize, search }],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set('limit', pageSize.toString());
      queryParams.set('offset', (currentPage * pageSize).toString());
      if (search.trim()) {
        queryParams.set('search', search.trim());
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
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <i className="fas fa-filter mr-2"></i>
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <i className="fas fa-download mr-2"></i>
                Exportar
              </Button>
            </div>
          </div>
        </div>

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
                    <TableHead>Profissão</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Candidatos</TableHead>
                    <TableHead>Salário</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs && jobs.length > 0 ? (
                    jobs.map((job: any) => (
                      <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
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
                                <i className="fas fa-map-marker-alt mr-1"></i>
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
                          <div className="text-sm text-foreground">
                            {job.department || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[job.status] || "secondary"}>
                            {statusLabels[job.status] || job.status}
                          </Badge>
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
                              <i className="fas fa-edit text-primary"></i>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-users text-green-600"></i>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-copy text-blue-600"></i>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingJobId(job.id)}
                              data-testid={`button-delete-${job.id}`}
                            >
                              <i className="fas fa-trash text-destructive"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="text-muted-foreground">
                          <i className="fas fa-briefcase text-4xl mb-4"></i>
                          <p className="text-lg font-medium mb-2">Nenhuma vaga encontrada</p>
                          <p className="text-sm">
                            {search
                              ? "Tente ajustar os filtros de busca"
                              : "Comece criando sua primeira vaga"}
                          </p>
                          {!search && (
                            <Button
                              onClick={() => setShowJobModal(true)}
                              className="mt-4"
                            >
                              <i className="fas fa-plus mr-2"></i>
                              Criar Primeira Vaga
                            </Button>
                          )}
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
