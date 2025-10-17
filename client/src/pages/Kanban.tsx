import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import TopBar from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Mail, Phone, Briefcase, Clock, Plus, Filter, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const KANBAN_STAGES = [
  { id: "entrevista_inicial", label: "Entrevista Inicial", color: "bg-blue-500" },
  { id: "teste_tecnico", label: "Teste Técnico/Comportamental", color: "bg-purple-500" },
  { id: "entrevista_gestor", label: "Entrevista com Gestor", color: "bg-orange-500" },
  { id: "proposta", label: "Proposta", color: "bg-green-500" },
  { id: "contratado", label: "Contratado", color: "bg-emerald-600" },
];

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  kanbanStage: string;
  appliedAt: string;
  notes?: string;
  candidate?: Candidate;
  job?: {
    profession?: {
      name: string;
    };
    company?: {
      name: string;
    };
  };
}

const candidateFormSchema = z.object({
  candidateName: z.string().min(3, "Nome completo é obrigatório"),
  candidateEmail: z.string().email("E-mail inválido"),
  candidatePhone: z.string().optional(),
  jobId: z.string().min(1, "Vaga é obrigatória"),
});

type CandidateFormData = z.infer<typeof candidateFormSchema>;

export default function Kanban() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState<Application | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [location] = useLocation();
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");

  // Parse jobId from URL query string
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const jobIdFromUrl = urlParams.get('jobId');

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications", selectedJobFilter],
    enabled: !!selectedJobFilter,
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (selectedJobFilter) {
        queryParams.set('jobId', selectedJobFilter);
      }
      const queryString = queryParams.toString();
      const applicationsUrl = `/api/applications${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(applicationsUrl, { credentials: "include" });
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return await response.json();
    },
  });

  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ["/api/jobs"],
  });

  useEffect(() => {
    if (jobIdFromUrl) {
      setSelectedJobFilter(jobIdFromUrl);
    } else if (jobs.length > 0 && !selectedJobFilter) {
      setSelectedJobFilter(jobs[0].id);
    }
  }, [jobIdFromUrl, jobs]);

  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      jobId: jobIdFromUrl || "",
    },
  });

  useEffect(() => {
    if (jobIdFromUrl) {
      form.setValue("jobId", jobIdFromUrl);
    }
  }, [jobIdFromUrl, form]);

  const createCandidateMutation = useMutation({
    mutationFn: async (data: CandidateFormData) => {
      // First, create the candidate
      const candidateResponse = await apiRequest("POST", "/api/candidates", {
        name: data.candidateName,
        email: data.candidateEmail,
        phone: data.candidatePhone || "",
      });
      const candidate = await candidateResponse.json();
      
      // Then, create the application linking candidate to job
      const applicationResponse = await apiRequest("POST", "/api/applications", {
        jobId: data.jobId,
        candidateId: candidate.id,
        kanbanStage: "entrevista_inicial", // Start at first stage
      });
      return applicationResponse.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Sucesso",
        description: "Candidato adicionado ao Kanban com sucesso!",
      });
      setShowCandidateModal(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar candidato. Tente novamente.",
        variant: "destructive",
      });
    },
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

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      await apiRequest("PATCH", `/api/applications/${id}`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Sucesso",
        description: "Notas salvas com sucesso!",
      });
      setShowNotesModal(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar notas. Tente novamente.",
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

  const onSubmit = (data: CandidateFormData) => {
    createCandidateMutation.mutate(data);
  };

  const handleOpenModal = () => {
    if (selectedJobFilter) {
      form.setValue("jobId", selectedJobFilter);
    }
    setShowCandidateModal(true);
  };

  const handleCloseModal = () => {
    setShowCandidateModal(false);
    form.reset();
  };

  const handleOpenNotes = (application: Application) => {
    setSelectedApplication(application);
    setNotes(application.notes || "");
    setShowNotesModal(true);
  };

  const handleSaveNotes = () => {
    if (selectedApplication) {
      updateNotesMutation.mutate({ id: selectedApplication.id, notes });
    }
  };

  return (
    <>
      <TopBar 
        title="Kanban de Candidatos"
        showCreateButton
        onCreateClick={handleOpenModal}
        createButtonText="Novo Candidato"
      />

      <div className="space-y-6">
        {/* Filter by Job */}
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {jobs.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Nenhuma vaga cadastrada. Crie uma vaga primeiro para usar o Kanban.
              </div>
            ) : (
              <Select value={selectedJobFilter} onValueChange={setSelectedJobFilter}>
                <SelectTrigger className="w-[300px]" data-testid="select-job-filter">
                  <SelectValue placeholder="Selecione uma vaga" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job: any) => (
                    <SelectItem key={job.id} value={job.id}>
                      [{job.jobCode || job.id.slice(0, 6)}] {job.profession?.name || job.title} - {job.company?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

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
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => {
            const stageApplications = getApplicationsByStage(stage.id);
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-56"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                <div className="bg-muted/30 rounded-lg p-3 h-full min-h-[500px]">
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
                                    {getInitials(application.candidate?.name || "?")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm truncate">
                                    {application.candidate?.name || "Candidato"}
                                  </h4>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{application.candidate?.email || "N/A"}</span>
                                  </div>
                                  {application.candidate?.phone && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{application.candidate.phone}</span>
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

                              {/* Date and Notes */}
                              <div className="flex items-center justify-between pt-2 border-t">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>Aplicado em {formatDate(application.appliedAt)}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenNotes(application)}
                                  className="h-7 px-2"
                                  title={application.notes ? "Ver/Editar notas" : "Adicionar notas"}
                                >
                                  <FileText className={`h-4 w-4 ${application.notes ? 'text-primary' : 'text-muted-foreground'}`} />
                                </Button>
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

      {/* Candidate Modal */}
      <Dialog open={showCandidateModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Candidato</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="João da Silva" {...field} data-testid="input-candidate-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="candidateEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="joao@example.com" 
                        {...field} 
                        data-testid="input-candidate-email" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="candidatePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(11) 99999-9999" 
                        {...field} 
                        data-testid="input-candidate-phone" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaga *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-job">
                          <SelectValue placeholder="Selecione a vaga" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobs.map((job: any) => (
                          <SelectItem key={job.id} value={job.id}>
                            [{job.jobCode || job.id.slice(0, 6)}] {job.profession?.name || job.title} - {job.company?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createCandidateMutation.isPending}
                  data-testid="button-save"
                >
                  {createCandidateMutation.isPending && (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  )}
                  Criar Candidato
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Notas do Candidato - {selectedApplication?.candidate?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notas Internas</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione notas sobre o candidato, observações da entrevista, feedback, etc..."
                className="min-h-[200px]"
                data-testid="textarea-notes"
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNotesModal(false)}
                data-testid="button-cancel-notes"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveNotes}
                disabled={updateNotesMutation.isPending}
                data-testid="button-save-notes"
              >
                {updateNotesMutation.isPending && (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                )}
                Salvar Notas
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
