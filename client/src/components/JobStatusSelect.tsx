import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

interface JobStatusSelectProps {
  jobId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const statusLabels: Record<string, string> = {
  active: "Ativa",
  draft: "Rascunho",
  paused: "Pausada", 
  closed: "Fechada",
  expired: "Expirada",
  aberto: "Aberto",
  em_recrutamento: "Em Recrutamento",
  em_documentacao: "Em Documentação"
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  draft: "secondary",
  paused: "outline",
  closed: "destructive",
  expired: "destructive",
  aberto: "default",
  em_recrutamento: "outline",
  em_documentacao: "secondary"
};

export default function JobStatusSelect({ jobId, currentStatus, onStatusChange }: JobStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      await apiRequest("PATCH", `/api/jobs/${jobId}/status`, { status: newStatus });
    },
    onSuccess: (_, newStatus) => {
      toast({
        title: "Status atualizado",
        description: `Status da vaga alterado para ${statusLabels[newStatus]}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/jobs-by-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      setIsEditing(false);
      onStatusChange?.(newStatus);
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status da vaga",
        variant: "destructive",
      });
      setSelectedStatus(currentStatus); // Reset to original status
    }
  });

  const handleSave = () => {
    if (selectedStatus !== currentStatus) {
      updateStatusMutation.mutate(selectedStatus);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div 
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:opacity-80 transition-opacity"
        data-testid={`status-badge-${jobId}`}
      >
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          statusVariants[currentStatus] === "default" ? "bg-primary text-primary-foreground border-primary" :
          statusVariants[currentStatus] === "secondary" ? "bg-secondary text-secondary-foreground border-secondary" :
          statusVariants[currentStatus] === "destructive" ? "bg-destructive text-destructive-foreground border-destructive" :
          "bg-background text-foreground border-border"
        }`}>
          {statusLabels[currentStatus] || currentStatus}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={selectedStatus} 
        onValueChange={setSelectedStatus}
        data-testid={`status-select-${jobId}`}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft" data-testid="status-option-draft">
            {statusLabels.draft}
          </SelectItem>
          <SelectItem value="active" data-testid="status-option-active">
            {statusLabels.active}
          </SelectItem>
          <SelectItem value="aberto" data-testid="status-option-aberto">
            {statusLabels.aberto}
          </SelectItem>
          <SelectItem value="em_recrutamento" data-testid="status-option-em_recrutamento">
            {statusLabels.em_recrutamento}
          </SelectItem>
          <SelectItem value="em_documentacao" data-testid="status-option-em_documentacao">
            {statusLabels.em_documentacao}
          </SelectItem>
          <SelectItem value="paused" data-testid="status-option-paused">
            {statusLabels.paused}
          </SelectItem>
          <SelectItem value="closed" data-testid="status-option-closed">
            {statusLabels.closed}
          </SelectItem>
          <SelectItem value="expired" data-testid="status-option-expired">
            {statusLabels.expired}
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleSave}
        disabled={updateStatusMutation.isPending}
        data-testid={`button-save-status-${jobId}`}
      >
        <Check className="h-4 w-4 text-green-600" />
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCancel}
        disabled={updateStatusMutation.isPending}
        data-testid={`button-cancel-status-${jobId}`}
      >
        <X className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  );
}