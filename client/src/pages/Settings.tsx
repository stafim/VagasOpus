import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings2, Edit, Trash2, Clock } from "lucide-react";
import { z } from "zod";

const workScaleFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
});

type WorkScaleFormData = z.infer<typeof workScaleFormSchema>;

type WorkScale = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function Settings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkScale, setEditingWorkScale] = useState<WorkScale | null>(null);
  const [deletingWorkScaleId, setDeletingWorkScaleId] = useState<string | undefined>();
  const { toast } = useToast();

  const form = useForm<WorkScaleFormData>({
    resolver: zodResolver(workScaleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { data: workScales = [], isLoading } = useQuery<WorkScale[]>({
    queryKey: ["/api/work-scales?includeInactive=true"],
  });

  const createWorkScaleMutation = useMutation({
    mutationFn: async (data: WorkScaleFormData) => {
      const response = await apiRequest("POST", "/api/work-scales", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-scales?includeInactive=true"] });
      toast({
        title: "Sucesso",
        description: "Escala de trabalho criada com sucesso!",
      });
      setIsModalOpen(false);
      form.reset();
      setEditingWorkScale(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar escala de trabalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateWorkScaleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkScaleFormData }) => {
      const response = await apiRequest("PUT", `/api/work-scales/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-scales?includeInactive=true"] });
      toast({
        title: "Sucesso",
        description: "Escala de trabalho atualizada com sucesso!",
      });
      setIsModalOpen(false);
      form.reset();
      setEditingWorkScale(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar escala de trabalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteWorkScaleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("PUT", `/api/work-scales/${id}`, { isActive: false });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-scales?includeInactive=true"] });
      toast({
        title: "Sucesso",
        description: "Escala de trabalho desativada com sucesso!",
      });
      setDeletingWorkScaleId(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desativar escala de trabalho. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WorkScaleFormData) => {
    if (editingWorkScale) {
      updateWorkScaleMutation.mutate({ id: editingWorkScale.id, data });
    } else {
      createWorkScaleMutation.mutate(data);
    }
  };

  const handleEdit = (workScale: WorkScale) => {
    setEditingWorkScale(workScale);
    form.reset({
      name: workScale.name,
      description: workScale.description || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteWorkScaleMutation.mutate(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWorkScale(null);
    form.reset({
      name: "",
      description: "",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gerencie as escalas de trabalho do sistema
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-work-scale" onClick={() => setEditingWorkScale(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Escala
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingWorkScale ? "Editar Escala de Trabalho" : "Nova Escala de Trabalho"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Escala</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: 5x1, 5x2, 6x1, 12x36"
                          data-testid="input-work-scale-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva os detalhes da escala de trabalho..."
                          rows={3}
                          data-testid="input-work-scale-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createWorkScaleMutation.isPending || updateWorkScaleMutation.isPending}
                    data-testid="button-save-work-scale"
                  >
                    {createWorkScaleMutation.isPending || updateWorkScaleMutation.isPending
                      ? "Salvando..."
                      : editingWorkScale
                      ? "Atualizar"
                      : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Escalas de Trabalho
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workScales.length === 0 ? (
            <p className="text-gray-500 text-center py-8" data-testid="text-no-work-scales">
              Nenhuma escala de trabalho cadastrada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workScales.map((workScale) => (
                  <TableRow key={workScale.id} data-testid={`work-scale-row-${workScale.id}`}>
                    <TableCell className="font-medium" data-testid={`text-work-scale-name-${workScale.id}`}>
                      {workScale.name}
                    </TableCell>
                    <TableCell data-testid={`text-work-scale-description-${workScale.id}`}>
                      {workScale.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={workScale.isActive ? "default" : "secondary"}
                        data-testid={`badge-work-scale-status-${workScale.id}`}
                      >
                        {workScale.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(workScale)}
                          data-testid={`button-edit-work-scale-${workScale.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {workScale.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingWorkScaleId(workScale.id)}
                            data-testid={`button-delete-work-scale-${workScale.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingWorkScaleId} onOpenChange={() => setDeletingWorkScaleId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Escala de Trabalho</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar esta escala de trabalho? Ela será marcada como inativa
              e não aparecerá mais nas opções de seleção.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingWorkScaleId && handleDelete(deletingWorkScaleId)}
              data-testid="button-confirm-delete"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
