import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import type { JobWithDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, UserCheck, XCircle } from "lucide-react";

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
}

export default function JobDetailsModal({ isOpen, onClose, jobId }: JobDetailsModalProps) {
  const { data: job, isLoading } = useQuery<JobWithDetails>({
    queryKey: ["/api/jobs", jobId],
    enabled: !!jobId && isOpen,
  });

  const formatDateTime = (date: string | Date) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      aberto: "Aberto",
      aprovada: "Aprovada",
      em_recrutamento: "Em Recrutamento",
      em_documentacao: "Em Documentação",
      dp: "DP",
      em_mobilizacao: "Em Mobilização",
      cancelada: "Cancelada",
      closed: "Fechada",
    };
    return labels[status] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Vaga {job?.jobCode}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : job ? (
          <div className="space-y-6">
            {/* Timeline de eventos */}
            <div className="space-y-4">
              {/* Abertura da vaga */}
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Vaga Aberta</h3>
                  <p className="text-sm text-muted-foreground">
                    {job.creator ? (
                      <>
                        Por: {job.creator.firstName} {job.creator.lastName}
                        {job.creator.email && ` (${job.creator.email})`}
                      </>
                    ) : (
                      "Criador não identificado"
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(job.createdAt)}
                  </p>
                </div>
              </div>

              {/* Aprovação (se status for aprovada ou superior) */}
              {job.status && ["aprovada", "em_recrutamento", "em_documentacao", "dp", "closed"].includes(job.status) && (
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Vaga Aprovada</h3>
                    <p className="text-sm text-muted-foreground">
                      Status atualizado para: {getStatusLabel(job.status)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateTime(job.updatedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Recrutamento */}
              {job.recruiter && (
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Recrutador Atribuído</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.recruiter.firstName} {job.recruiter.lastName}
                      {job.recruiter.email && ` (${job.recruiter.email})`}
                    </p>
                  </div>
                </div>
              )}

              {/* Fechamento */}
              {job.status === "closed" && (
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Vaga Fechada</h3>
                    <p className="text-sm text-muted-foreground">
                      Data de fechamento: {formatDateTime(job.updatedAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* Cancelamento */}
              {job.status === "cancelada" && (
                <div className="flex gap-4 items-start">
                  <div className="mt-1">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Vaga Cancelada</h3>
                    <p className="text-sm text-muted-foreground">
                      Data de cancelamento: {formatDateTime(job.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Informações adicionais */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Informações Adicionais</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Status Atual:</p>
                  <p className="font-medium">{getStatusLabel(job.status)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Atualização:</p>
                  <p className="font-medium">{formatDateTime(job.updatedAt)}</p>
                </div>
                {job.company && (
                  <div>
                    <p className="text-muted-foreground">Empresa:</p>
                    <p className="font-medium">{job.company.name}</p>
                  </div>
                )}
                {job.profession && (
                  <div>
                    <p className="text-muted-foreground">Profissão:</p>
                    <p className="font-medium">{job.profession.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Vaga não encontrada
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
