import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JobWithDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Clock, UserCheck, XCircle, StickyNote } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId?: string;
}

export default function JobDetailsModal({ isOpen, onClose, jobId }: JobDetailsModalProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery<any>({
    queryKey: ["/api/jobs", jobId],
    enabled: !!jobId && isOpen,
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      await apiRequest("PATCH", `/api/jobs/${jobId}/notes`, { notes });
    },
    onSuccess: async () => {
      toast({
        title: "Nota salva",
        description: "A nota foi salva com sucesso",
      });
      // Force refetch of the job data
      await queryClient.refetchQueries({ queryKey: ["/api/jobs", jobId] });
      setIsEditingNotes(false);
    },
    onError: (error) => {
      console.error("Error updating notes:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar a nota",
        variant: "destructive",
      });
    }
  });

  const handleSaveNotes = () => {
    updateNotesMutation.mutate(notesText);
  };

  const handleCreateNote = () => {
    setNotesText(job?.notes || "");
    setIsEditingNotes(true);
  };

  const handleCancelNotes = () => {
    setNotesText("");
    setIsEditingNotes(false);
  };

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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Informações Adicionais</h3>
                {!isEditingNotes && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNote}
                    data-testid="button-create-note"
                  >
                    <StickyNote className="h-4 w-4 mr-2" />
                    {job?.notes ? "Editar Nota" : "Criar Nota"}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
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

              {/* Notas section */}
              {isEditingNotes ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nota:</label>
                    <Textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      placeholder="Digite suas observações sobre esta vaga..."
                      className="min-h-[120px]"
                      data-testid="textarea-notes"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelNotes}
                      disabled={updateNotesMutation.isPending}
                      data-testid="button-cancel-notes"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={updateNotesMutation.isPending}
                      data-testid="button-save-notes"
                    >
                      {updateNotesMutation.isPending ? "Salvando..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">Notas:</p>
                      {job?.notes ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.notes}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Nenhuma nota adicionada ainda</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
