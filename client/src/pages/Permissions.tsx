import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserCompanyRoleSchema, type InsertUserCompanyRole } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Shield } from "lucide-react";

const roleLabels = {
  admin: "Administrador",
  hr_manager: "Gerente RH", 
  recruiter: "Recrutador",
  interviewer: "Entrevistador",
  viewer: "Visualizador",
  approver: "Aprovador",
  manager: "Gestor"
};

const roleColors = {
  admin: "bg-red-100 text-red-800",
  hr_manager: "bg-blue-100 text-blue-800",
  recruiter: "bg-green-100 text-green-800", 
  interviewer: "bg-yellow-100 text-yellow-800",
  viewer: "bg-gray-100 text-gray-800",
  approver: "bg-purple-100 text-purple-800",
  manager: "bg-orange-100 text-orange-800"
};

export default function Permissions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user roles
  const { data: userRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["/api/permissions/user-roles"],
  });

  // Get companies for assignment
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Get role permissions
  const { data: rolePermissions = [] } = useQuery({
    queryKey: ["/api/permissions/roles/permissions"],
  });

  // Setup default permissions mutation
  const setupDefaultsMutation = useMutation({
    mutationFn: () => apiRequest("/api/permissions/setup-defaults", "POST", {}),
    onSuccess: () => {
      toast({ title: "Permissões padrão configuradas com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/roles/permissions"] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao configurar permissões padrão", 
        variant: "destructive" 
      });
    }
  });

  // Assign user mutation
  const assignUserMutation = useMutation({
    mutationFn: (data: InsertUserCompanyRole) => 
      apiRequest("/api/permissions/assign", "POST", data),
    onSuccess: () => {
      toast({ title: "Usuário atribuído com sucesso" });
      queryClient.invalidateQueries({ queryKey: ["/api/permissions/user-roles"] });
      setIsModalOpen(false);
    },
    onError: () => {
      toast({ 
        title: "Erro ao atribuir usuário", 
        variant: "destructive" 
      });
    }
  });

  // Form for assigning users
  const form = useForm<InsertUserCompanyRole>({
    resolver: zodResolver(insertUserCompanyRoleSchema),
    defaultValues: {
      userId: "",
      companyId: "",
      role: "viewer" as any,
      costCenterId: null,
      isActive: true
    }
  });

  const onSubmit = (data: InsertUserCompanyRole) => {
    assignUserMutation.mutate(data);
  };

  if (rolesLoading) {
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
            Gestão de Permissões
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Gerencie permissões de usuários por empresa e centro de custo
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setupDefaultsMutation.mutate()}
            disabled={setupDefaultsMutation.isPending}
            variant="outline"
            data-testid="button-setup-defaults"
          >
            <Shield className="h-4 w-4 mr-2" />
            Configurar Padrões
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-assign-user">
                <Plus className="h-4 w-4 mr-2" />
                Atribuir Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Usuário à Empresa</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="userId">ID do Usuário</Label>
                  <Input
                    id="userId"
                    {...form.register("userId")}
                    placeholder="ID do usuário"
                    data-testid="input-user-id"
                  />
                </div>
                <div>
                  <Label htmlFor="companyId">Empresa</Label>
                  <Select 
                    value={form.watch("companyId")} 
                    onValueChange={(value) => form.setValue("companyId", value)}
                  >
                    <SelectTrigger data-testid="select-company">
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company: any) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select 
                    value={form.watch("role")} 
                    onValueChange={(value) => form.setValue("role", value as any)}
                  >
                    <SelectTrigger data-testid="select-role">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={assignUserMutation.isPending}
                    data-testid="button-save-assignment"
                  >
                    Atribuir
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Suas Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userRoles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Você ainda não possui permissões em nenhuma empresa
            </p>
          ) : (
            <div className="space-y-4">
              {userRoles.map((role: any) => (
                <div 
                  key={role.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">Empresa: {role.companyId}</p>
                      {role.costCenterId && (
                        <p className="text-sm text-gray-500">
                          Centro de Custo: {role.costCenterId}
                        </p>
                      )}
                    </div>
                    <Badge className={roleColors[role.role as keyof typeof roleColors]}>
                      {roleLabels[role.role as keyof typeof roleLabels]}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Desde: {new Date(role.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Permissões por Função</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(roleLabels).map(([roleKey, roleLabel]) => {
              const permissions = rolePermissions.filter((p: any) => 
                p.role === roleKey && p.isGranted
              );
              
              return (
                <div key={roleKey} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={roleColors[roleKey as keyof typeof roleColors]}>
                      {roleLabel}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      ({permissions.length} permissões)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((permission: any) => (
                      <Badge key={permission.id} variant="outline">
                        {permission.permission.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}