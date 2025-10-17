import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompaniesListResponse } from "@shared/schema";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import CompanyModal from "@/components/CompanyModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Building2, ExternalLink, Pencil, Trash2 } from "lucide-react";

export default function Companies() {
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | undefined>();
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery<CompaniesListResponse>({
    queryKey: ["/api/companies"],
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      await apiRequest("DELETE", `/api/companies/${companyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Sucesso",
        description: "Empresa excluída com sucesso!",
      });
      setDeletingCompanyId(undefined);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir empresa. Verifique se não há vagas vinculadas.",
        variant: "destructive",
      });
    },
  });

  const handleEditCompany = (companyId: string) => {
    setEditingCompanyId(companyId);
    setShowCompanyModal(true);
  };

  const handleCloseModal = () => {
    setShowCompanyModal(false);
    setEditingCompanyId(undefined);
  };

  const handleDeleteCompany = (companyId: string) => {
    deleteCompanyMutation.mutate(companyId);
  };

  const filteredCompanies = companies?.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <>
      <TopBar
        title="Empresas"
        showCreateButton
        onCreateClick={() => setShowCompanyModal(true)}
        createButtonText="Nova Empresa"
      />

      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Buscar empresas..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-companies"
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <i className="fas fa-download mr-2"></i>
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredCompanies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Empresa</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-center">Vagas</TableHead>
                    <TableHead className="text-center">Centros de Custo</TableHead>
                    <TableHead className="text-center">Data de Cadastro</TableHead>
                    <TableHead className="text-right w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company: any) => (
                    <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium" data-testid={`text-company-name-${company.id}`}>
                              {company.name}
                            </div>
                            {company.website && (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          {company.description ? (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {company.description}
                            </p>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Sem descrição</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" data-testid={`text-jobs-count-${company.id}`}>
                          {company.jobsCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {company.costCenters && company.costCenters.length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            <Badge variant="outline">{company.costCenters.length}</Badge>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm text-muted-foreground">
                          {new Date(company.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCompany(company.id)}
                            data-testid={`button-edit-company-${company.id}`}
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCompanyId(company.id)}
                            data-testid={`button-delete-company-${company.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  {search ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {search
                    ? "Tente ajustar sua busca"
                    : "Comece cadastrando a primeira empresa"}
                </p>
                {!search && (
                  <Button onClick={() => setShowCompanyModal(true)}>
                    <i className="fas fa-plus mr-2"></i>
                    Cadastrar Primeira Empresa
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company Modal */}
      <CompanyModal
        isOpen={showCompanyModal}
        onClose={handleCloseModal}
        companyId={editingCompanyId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCompanyId} onOpenChange={() => setDeletingCompanyId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.
              Certifique-se de que não há vagas vinculadas a esta empresa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCompanyId && handleDeleteCompany(deletingCompanyId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Empresa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
