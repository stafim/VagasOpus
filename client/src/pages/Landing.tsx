import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient } from "@/lib/queryClient";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function Landing() {
  const { isLoading } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/login", data);

      toast({
        title: "Login realizado com sucesso",
        description: "Redirecionando...",
      });

      // Invalidate auth query to refetch user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/auth/register", data);

      toast({
        title: "Conta criada com sucesso",
        description: "Redirecionando...",
      });

      // Invalidate auth query to refetch user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">VagasPro</CardTitle>
          <CardDescription>Sistema de Gestão de Vagas</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2 mb-6">
              <Button
                variant={isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(true)}
                className="flex-1"
                data-testid="button-switch-login"
              >
                Login
              </Button>
              <Button
                variant={!isLogin ? "default" : "outline"}
                onClick={() => setIsLogin(false)}
                className="flex-1"
                data-testid="button-switch-register"
              >
                Cadastro
              </Button>
            </div>

            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...loginForm.register("email")}
                    data-testid="input-email"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register("password")}
                    data-testid="input-password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  data-testid="button-login"
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    {...registerForm.register("email")}
                    data-testid="input-register-email"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    {...registerForm.register("password")}
                    data-testid="input-register-password"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="firstName">Nome</Label>
                  <Input
                    id="firstName"
                    {...registerForm.register("firstName")}
                    data-testid="input-first-name"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input
                    id="lastName"
                    {...registerForm.register("lastName")}
                    data-testid="input-last-name"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  data-testid="button-register"
                >
                  {isSubmitting ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
