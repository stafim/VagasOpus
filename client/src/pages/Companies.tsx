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

        {/* Companies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : (
          <>
            {filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company: any) => (
                  <Card key={company.id} className="hover:shadow-md transition-shadow" data-testid={`card-company-${company.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <i className="fas fa-building text-primary"></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg" data-testid={`text-company-name-${company.id}`}>
                              {company.name}
                            </CardTitle>
                            {company.website && (
                              <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                <i className="fas fa-external-link-alt mr-1"></i>
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCompany(company.id)}
                            data-testid={`button-edit-company-${company.id}`}
                          >
                            <i className="fas fa-edit text-primary"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCompanyId(company.id)}
                            data-testid={`button-delete-company-${company.id}`}
                          >
                            <i className="fas fa-trash text-destructive"></i>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {company.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {company.description}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Vagas Ativas</span>
                          <Badge variant="secondary" data-testid={`text-jobs-count-${company.id}`}>
                            {company.jobsCount || 0}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Centros de Custo</span>
                          <Badge variant="outline">
                            {company.costCenters?.length || 0}
                          </Badge>
                        </div>
                      </div>

                      {company.costCenters && company.costCenters.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Centros de Custo:</p>
                          <div className="flex flex-wrap gap-1">
                            {company.costCenters.slice(0, 3).map((center: any) => (
                              <Badge key={center.id} variant="outline" className="text-xs">
                                {center.name}
                              </Badge>
                            ))}
                            {company.costCenters.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{company.costCenters.length - 3} mais
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Criado em</span>
                          <span>{new Date(company.createdAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <i className="fas fa-building text-4xl mb-4"></i>
                  <p className="text-lg font-medium mb-2">
                    {search ? "Nenhuma empresa encontrada" : "Nenhuma empresa cadastrada"}
                  </p>
                  <p className="text-sm mb-4">
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
              </div>
            )}
          </>
        )}
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
