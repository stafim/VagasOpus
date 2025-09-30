import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Client } from "@shared/schema";
import TopBar from "@/components/TopBar";
import ClientModal from "@/components/ClientModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Clients() {
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | undefined>();
  const [deletingClientId, setDeletingClientId] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  const { toast } = useToast();

  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      await apiRequest("DELETE", `/api/clients/${clientId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!",
      });
      setDeletingClientId(undefined);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente.",
        variant: "destructive",
      });
    },
  });

  const handleEditClient = (clientId: string) => {
    setEditingClientId(clientId);
    setShowClientModal(true);
  };

  const handleCloseModal = () => {
    setShowClientModal(false);
    setEditingClientId(undefined);
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClientMutation.mutate(clientId);
  };

  const filteredClients = clients?.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.contactPerson?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <>
      <TopBar
        title="Clientes"
        showCreateButton
        onCreateClick={() => setShowClientModal(true)}
        createButtonText="Novo Cliente"
      />

      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Buscar clientes..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-clients"
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

        {/* Clients Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : (
          <>
            {filteredClients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow" data-testid={`card-client-${client.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <i className="fas fa-user-tie text-primary"></i>
                          </div>
                          <div>
                            <CardTitle className="text-lg" data-testid={`text-client-name-${client.id}`}>
                              {client.name}
                            </CardTitle>
                            {client.city && (
                              <p className="text-xs text-muted-foreground">
                                {client.city} - {client.state}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClient(client.id)}
                            data-testid={`button-edit-client-${client.id}`}
                          >
                            <i className="fas fa-edit text-primary"></i>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingClientId(client.id)}
                            data-testid={`button-delete-client-${client.id}`}
                          >
                            <i className="fas fa-trash text-destructive"></i>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {client.contactPerson && (
                          <div className="flex items-center text-sm">
                            <i className="fas fa-user w-4 text-muted-foreground mr-2"></i>
                            <span data-testid={`text-contact-${client.id}`}>{client.contactPerson}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-sm">
                            <i className="fas fa-phone w-4 text-muted-foreground mr-2"></i>
                            <span data-testid={`text-phone-${client.id}`}>{client.phone}</span>
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center text-sm">
                            <i className="fas fa-envelope w-4 text-muted-foreground mr-2"></i>
                            <span data-testid={`text-email-${client.id}`}>{client.email}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-start text-sm">
                            <i className="fas fa-map-marker-alt w-4 text-muted-foreground mr-2 mt-0.5"></i>
                            <span className="line-clamp-2" data-testid={`text-address-${client.id}`}>{client.address}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <i className="fas fa-user-tie text-6xl text-muted-foreground mb-4"></i>
                  <h3 className="text-xl font-semibold mb-2">Nenhum cliente encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {search ? "Tente ajustar sua busca" : "Comece cadastrando seu primeiro cliente"}
                  </p>
                  {!search && (
                    <Button onClick={() => setShowClientModal(true)} data-testid="button-create-first-client">
                      <i className="fas fa-plus mr-2"></i>
                      Novo Cliente
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Client Modal */}
      {showClientModal && (
        <ClientModal
          clientId={editingClientId}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingClientId} onOpenChange={() => setDeletingClientId(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingClientId && handleDeleteClient(deletingClientId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
