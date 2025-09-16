import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";

export default function Users() {
  return (
    <>
      <TopBar title="Usuários" />
      
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <i className="fas fa-users text-4xl mb-4"></i>
              <p className="text-lg font-medium mb-2">Gestão de Usuários</p>
              <p className="text-sm">
                Esta funcionalidade será implementada em uma próxima versão.
                Por enquanto, a autenticação é gerenciada pelo Replit Auth.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
