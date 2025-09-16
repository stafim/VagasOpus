export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-briefcase text-primary-foreground text-2xl"></i>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">VagasPro</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Sistema completo de gestão de vagas para sua empresa
          </p>
          <div className="space-y-4">
            <a
              href="/api/login"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              data-testid="button-login"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Entrar no Sistema
            </a>
            <p className="text-sm text-muted-foreground">
              Entre com sua conta para acessar o painel de gestão de vagas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
