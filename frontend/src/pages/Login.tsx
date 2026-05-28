import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface LoginPageProps {
  onLoginSucess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSucess }) => {
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [showTrocaSenha, setShowTrocaSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [novaSenha2, setNovaSenha2] = useState("");
  const { setAuth } = useAuth();

  const handleLoginUser = async () => {
    if (!username || !pass) {
      toast.error("Preenchimento obrigatório", {
        description: "Por favor, preencha o Usuário e a Senha.",
      });
      return;
    }

    setIsLoading(true);
    console.log(
      `Tentando realizar login com: Usuário: ${username} e Senha: ${pass}`,
    );

    try {
      const res = await fetch("http://localhost:8080/user/login_user", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, pass: pass }),
      });

      const data = await res.json();
      if (data && data.token) {
        setAuth({ token: data.token, username: username });
        if (data.primeiro_acesso === 1) {
          setShowTrocaSenha(true);
        } else {
          onLoginSucess();
          toast.success("Login bem sucedido!", {
            description: `Username: ${username}`,
          });
        }
      } else {
        toast.error("Login falhou", {
          description: data?.message ?? "Credenciais inválidas.",
        });
      }
    } catch (error) {
      console.log("Erro ao tentar login: ", error);
      toast.error("Erro de conexão", {
        description:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!username) {
      toast.error("Preenchimento obrigatório", {
        description: "Por favor, preencha os campo usuário.",
      });
      return;
    }

    const res = await fetch("http://localhost:8080/user/reset_password", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    });

    if (res.ok) {
      const data = await res.json();

      if (data.success) {
        toast.success("Reset bem sucedido!", {
          description: `Um email foi enviado com a senha temporária.`,
        });
      }
    } else {
      const data = await res.json();
      toast.error(data?.message ?? "Erro ao solicitar reset de senha.");
    }
  };

  const handleTrocaSenha = async () => {
    if (!novaSenha || !novaSenha2) {
      toast.error("Preenchimento obrigatório", {
        description: "Por favor, preencha os dois campos de senha.",
      });
      return;
    }

    if (novaSenha !== novaSenha2) {
      toast.error("Preenchimento incorreto", {
        description:
          "Por favor, preencha os dois campos de senha com o mesmo valor.",
      });
      return;
    }

    setIsLoading2(true);
    console.log(`Tentando realizar troca de senha para: Usuário: ${username}`);

    try {
      const res = await fetch("http://localhost:8080/user/change_password", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, newpass: novaSenha }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.success) {
          setShowTrocaSenha(false);
          onLoginSucess();
          toast.success("Troca bem sucedida!", {
            description: `Senha alterada com sucesso.`,
          });
        }
      } else {
        const data = await res.json();
        toast.error(data?.message ?? "Erro ao trocar a senha.");
      }
    } catch (error) {
      console.log("Erro ao tentar trocar a senha: ", error);
      toast.error("Erro de conexão", {
        description:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading2(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-2">
      <Card className="transition-all ease-in-out duration-300 w-full max-w-md p6 bg-gray-900 text-white rounded-xl shadow-2xl hover:shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription className="text-gray-400">
            Informe usuário e senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="usuario">Usuário</Label>
            <Input
              id="usuario"
              type="text"
              placeholder=""
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            ></Input>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass">Senha</Label>
            <Input
              id="pass"
              type="password"
              placeholder=""
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            ></Input>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex justify-between w-full gap-4">
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={handleLoginUser}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                "Login"
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={handleResetPassword}
            >
              Esqueci a Senha
            </Button>
          </div>
        </CardFooter>
      </Card>
      <Dialog open={showTrocaSenha}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 [&>button:last-child]:hidden">
          <DialogHeader>
            <DialogTitle className="text-white">
              Crie uma nova senha
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Defina sua senha pessoal
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="newPass">Nova senha</Label>
          <Input
            id="newPass"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
          <Label htmlFor="newPass_repeat">Repita a nova senha</Label>
          <Input
            id=":newPass_repeat"
            type="password"
            value={novaSenha2}
            onChange={(e) => setNovaSenha2(e.target.value)}
          />
          <Button
            variant="outline"
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
            onClick={handleTrocaSenha}
          >
            {isLoading2 ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogContent>
      </Dialog>
      <span className="text-xs text-gray-500">v{__APP_VERSION__}</span>
    </div>
  );
};

export default LoginPage;
