import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        onLoginSucess();
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

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
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
            >
              Esqueci a Senha
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
