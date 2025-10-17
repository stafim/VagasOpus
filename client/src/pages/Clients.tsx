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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, MapPin, Phone, Mail, Pencil, Trash2 } from "lucide-react";

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

        {/* Clients Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredClients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Cliente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead className="text-right w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <UserCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium" data-testid={`text-client-name-${client.id}`}>
                              {client.name}
                            </div>
                            {client.city && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {client.city} - {client.state}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.contactPerson ? (
                          <span className="text-sm" data-testid={`text-contact-${client.id}`}>
                            {client.contactPerson}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.phone ? (
                          <div className="flex items-center gap-1 text-sm" data-testid={`text-phone-${client.id}`}>
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {client.phone}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.email ? (
                          <div className="flex items-center gap-1 text-sm" data-testid={`text-email-${client.id}`}>
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {client.email}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {client.address ? (
                          <div className="max-w-xs">
                            <span className="text-sm text-muted-foreground line-clamp-1" data-testid={`text-address-${client.id}`}>
                              {client.address}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClient(client.id)}
                            data-testid={`button-edit-client-${client.id}`}
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingClientId(client.id)}
                            data-testid={`button-delete-client-${client.id}`}
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
                <UserCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
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
              </div>
            )}
          </CardContent>
        </Card>
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
