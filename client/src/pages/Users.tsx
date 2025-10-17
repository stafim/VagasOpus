import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, Mail, Shield, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";

const roleLabels: Record<string, string> = {
  user: "Usuário",
  admin: "Administrador",
  recruiter: "Recrutador",
  approver: "Aprovador",
  manager: "Gestor"
};

const roleColors: Record<string, string> = {
  user: "bg-gray-100 text-gray-800",
  admin: "bg-red-100 text-red-800",
  recruiter: "bg-green-100 text-green-800",
  approver: "bg-purple-100 text-purple-800",
  manager: "bg-orange-100 text-orange-800"
};

const userFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.string().min(1, "Selecione um tipo de permissão")
});

type UserFormData = z.infer<typeof userFormSchema>;

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user"
    }
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!",
      });
      setIsModalOpen(false);
      setEditingUser(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UserFormData }) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!",
      });
      setIsModalOpen(false);
      setEditingUser(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar usuário.",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });
      setDeleteUserId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir usuário.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (user: any) => {
    setEditingUser(user);
    form.reset({
      name: user.firstName || user.lastName || "",
      email: user.email,
      password: "",
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteUserId(id);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };

  const onSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    form.reset();
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
            Gestão de Usuários
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-user">
              <Plus className="h-4 w-4 mr-2" />
              NOVO
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuário" : "Criar Novo Usuário"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nome completo"
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="usuario@exemplo.com"
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de permissão</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-role">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    data-testid="button-save-user"
                  >
                    {createUserMutation.isPending || updateUserMutation.isPending 
                      ? (editingUser ? "Atualizando..." : "Criando...") 
                      : (editingUser ? "Atualizar" : "Criar")}
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
            <User className="h-5 w-5" />
            Usuários do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum usuário cadastrado
            </p>
          ) : (
            <div className="space-y-4">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid={`user-item-${user.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-2 rounded-full flex items-center justify-center shadow-sm">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground" data-testid={`text-username-${user.id}`}>
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={roleColors[user.role as keyof typeof roleColors] || roleColors.user}
                      data-testid={`badge-role-${user.id}`}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      Desde: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        data-testid={`button-edit-${user.id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        data-testid={`button-delete-${user.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
