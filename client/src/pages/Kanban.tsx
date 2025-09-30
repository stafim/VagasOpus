import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Users, Mail, Phone, Briefcase, Clock } from "lucide-react";

const KANBAN_STAGES = [
  { id: "entrevista_inicial", label: "Entrevista Inicial", color: "bg-blue-500" },
  { id: "teste_tecnico", label: "Teste Técnico/Comportamental", color: "bg-purple-500" },
  { id: "entrevista_gestor", label: "Entrevista com Gestor", color: "bg-orange-500" },
  { id: "proposta", label: "Proposta", color: "bg-green-500" },
  { id: "contratado", label: "Contratado", color: "bg-emerald-600" },
];

interface Application {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  kanbanStage: string;
  appliedAt: string;
  job?: {
    profession?: {
      name: string;
    };
    company?: {
      name: string;
    };
  };
}

export default function Kanban() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState<Application | null>(null);

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      await apiRequest("PATCH", `/api/applications/${id}`, { kanbanStage: stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Sucesso",
        description: "Candidato movido para nova etapa!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao mover candidato. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleDragStart = (application: Application) => {
    setDraggedItem(application);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (stageId: string) => {
    if (draggedItem && draggedItem.kanbanStage !== stageId) {
      updateStageMutation.mutate({ id: draggedItem.id, stage: stageId });
    }
    setDraggedItem(null);
  };

  const getApplicationsByStage = (stageId: string) => {
    return applications.filter((app) => app.kanbanStage === stageId);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <>
      <TopBar title="Kanban de Candidatos" />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {KANBAN_STAGES.map((stage) => {
            const count = getApplicationsByStage(stage.id).length;
            return (
              <Card key={stage.id} className="border-t-4" style={{ borderTopColor: stage.color.replace("bg-", "") }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stage.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => {
            const stageApplications = getApplicationsByStage(stage.id);
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                <div className="bg-muted/30 rounded-lg p-4 h-full min-h-[600px]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                      <h3 className="font-semibold text-sm">{stage.label}</h3>
                    </div>
                    <Badge variant="secondary">{stageApplications.length}</Badge>
                  </div>

                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="text-center text-muted-foreground py-8">Carregando...</div>
                    ) : stageApplications.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8 text-sm">
                        Nenhum candidato
                      </div>
                    ) : (
                      stageApplications.map((application) => (
                        <Card
                          key={application.id}
                          draggable
                          onDragStart={() => handleDragStart(application)}
                          className="cursor-move hover:shadow-md transition-shadow bg-card"
                          data-testid={`card-application-${application.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Candidate Info */}
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {getInitials(application.candidateName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">
                                    {application.candidateName}
                                  </h4>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{application.candidateEmail}</span>
                                  </div>
                                  {application.candidatePhone && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{application.candidatePhone}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Job Info */}
                              {application.job && (
                                <div className="space-y-1">
                                  {application.job.profession && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <Briefcase className="h-3 w-3 text-muted-foreground" />
                                      <span className="font-medium">
                                        {application.job.profession.name}
                                      </span>
                                    </div>
                                  )}
                                  {application.job.company && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Users className="h-3 w-3" />
                                      <span>{application.job.company.name}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Date */}
                              <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                                <Clock className="h-3 w-3" />
                                <span>Aplicado em {formatDate(application.appliedAt)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
