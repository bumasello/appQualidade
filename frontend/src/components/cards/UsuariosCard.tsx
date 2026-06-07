import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface Equipe {
  ID: number;
  NOME: string;
  DESCRICAO: string | null;
  ATIVO: number;
}

interface Usuario {
  ID: number;
  NOME_COMPLETO: string;
  USERNAME: string;
  EQUIPE_ID: number | null;
  EQUIPE_NOME: string | null;
  ATIVO: number;
}

const API = "http://localhost:8080";

const Usuarios: React.FC = () => {
  const { auth } = useAuth();
  const [equipes, set_equipes] = useState<Equipe[]>([]);
  const [usuarios, set_usuarios] = useState<Usuario[]>([]);
  const [novo_nome, set_novo_nome] = useState("");
  const [novo_username, set_novo_username] = useState("");
  const [novo_email, set_novo_email] = useState("");
  const [novo_equipe_id, set_novo_equipe_id] = useState("");

  const authHeaders = { Authorization: `Bearer ${auth.token}` };

  const alterar_status_usuario = async (user_id: number, ativo: number) => {
    const res = await fetch(`${API}/user/${user_id}/status`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ativo }),
    });

    if (res.ok) {
      toast.success(ativo === 1 ? "Usuário ativado!" : "Usuário desativado!");
      carregar_usuarios();
    } else {
      toast.error("Erro ao alterar o status.");
    }
  };

  const carregar_usuarios = async () => {
    const res = await fetch(`${API}/user/listar`, { headers: authHeaders });
    if (res.ok) set_usuarios((await res.json()).usuarios);
  };

  const criar_usuario = async () => {
    if (
      !novo_nome.trim() ||
      !novo_username.trim() ||
      !novo_email.trim() ||
      !novo_equipe_id
    ) {
      toast.error("Preencha todos os campos do usuário.");
      return;
    }

    const res = await fetch(`${API}/user/create_user`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_completo: novo_nome,
        username: novo_username,
        email: novo_email,
        equipe_id: Number(novo_equipe_id),
      }),
    });

    if (res.ok) {
      toast.success("Usuário criado!");
      set_novo_nome("");
      set_novo_username("");
      set_novo_email("");
      set_novo_equipe_id("");
      carregar_usuarios();
    } else {
      toast.error("Erro ao criar usuário.");
    }
  };

  const alterar_equipe_usuario = async (user_id: number, equipe_id: number) => {
    const res = await fetch(`${API}/user/${user_id}/equipe`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ equipe_id }),
    });

    if (res.ok) {
      toast.success("Equipe atualizada!");
      carregar_usuarios();
    } else {
      toast.error("Erro ao alterar a equipe.");
    }
  };

  useEffect(() => {
    const carregar = async () => {
      try {
        const [eq, tl, us] = await Promise.all([
          fetch(`${API}/equipe/listar`, { headers: authHeaders }),
          fetch(`${API}/tela/listar`, { headers: authHeaders }),
          fetch(`${API}/user/listar`, { headers: authHeaders }),
        ]);

        if (!eq.ok || !tl.ok || !us.ok) {
          toast.error("Erro ao carregar dados de configuração.");
          return;
        }

        set_equipes((await eq.json()).equipes);
        set_usuarios((await us.json()).usuarios);
      } catch (error) {
        toast.error("Erro de conexão com o servidor.");
      }
    };

    carregar();
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Configurações</h1>

      <Card className="bg-gray-900 text-white border-gray-700">
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 border-b border-gray-700 pb-4">
            <Label>Novo usuário</Label>
            <Input
              value={novo_nome}
              onChange={(ev) => set_novo_nome(ev.target.value)}
              placeholder="Nome completo"
              className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            />
            <Input
              value={novo_username}
              onChange={(ev) => set_novo_username(ev.target.value)}
              placeholder="Usuário (login)"
              className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            />
            <Input
              type="email"
              value={novo_email}
              onChange={(ev) => set_novo_email(ev.target.value)}
              placeholder="E-mail"
              className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            />
            <Select value={novo_equipe_id} onValueChange={set_novo_equipe_id}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Equipe" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {equipes.map((e) => (
                  <SelectItem
                    key={e.ID}
                    value={String(e.ID)}
                    className="cursor-pointer"
                  >
                    {e.NOME}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={criar_usuario}
              variant="outline"
              className="w-full border-gray-700 hover:bg-gray-700 hover:border-gray-400"
            >
              Criar usuário
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Usuários</Label>
            {usuarios.map((u) => (
              <div
                key={u.ID}
                className={cn(
                  "flex items-center justify-between gap-2",
                  u.ATIVO === 0 && "opacity-50",
                )}
              >
                <span className="text-sm">
                  {u.NOME_COMPLETO}
                  {u.ATIVO === 0 && (
                    <span className="ml-2 text-xs text-red-400">(inativo)</span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <Select
                    value={
                      u.EQUIPE_ID != null ? String(u.EQUIPE_ID) : undefined
                    }
                    onValueChange={(value) =>
                      alterar_equipe_usuario(u.ID, Number(value))
                    }
                  >
                    <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Sem equipe" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {equipes.map((e) => (
                        <SelectItem
                          key={e.ID}
                          value={String(e.ID)}
                          className="cursor-pointer"
                        >
                          {e.NOME}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() =>
                      alterar_status_usuario(u.ID, u.ATIVO === 1 ? 0 : 1)
                    }
                    variant="outline"
                    className={cn(
                      "cursor-pointer border-gray-700",
                      u.ATIVO === 1
                        ? "text-red-400 hover:bg-red-950 hover:text-red-300"
                        : "text-green-400 hover:bg-green-950 hover:text-green-300",
                    )}
                  >
                    {u.ATIVO === 1 ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Usuarios;
