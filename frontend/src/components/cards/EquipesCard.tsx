import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Equipe {
  ID: number;
  NOME: string;
  DESCRICAO: string | null;
  ATIVO: number;
}

interface Tela {
  ID: number;
  CHAVE: string;
  NOME: string;
  DESCRICAO: string | null;
  ATIVO: number;
}

const API = "http://localhost:8080";

const Equipes: React.FC = () => {
  const { auth } = useAuth();
  const [equipes, set_equipes] = useState<Equipe[]>([]);
  const [telas, set_telas] = useState<Tela[]>([]);
  const [selected_equipe_id, set_selected_equipe_id] = useState<number | null>(
    null,
  );
  const [equipe_tela_ids, set_equipe_tela_ids] = useState<number[]>([]);
  const [nova_equipe_nome, set_nova_equipe_nome] = useState("");
  const [nova_equipe_descricao, set_nova_equipe_descricao] = useState("");

  const authHeaders = { Authorization: `Bearer ${auth.token}` };

  const carregar_equipes = async () => {
    const res = await fetch(`${API}/equipe/listar`, { headers: authHeaders });
    if (res.ok) set_equipes((await res.json()).equipes);
  };

  const selecionar_equipe = async (id: number) => {
    const res = await fetch(`${API}/equipe/${id}/telas`, {
      headers: authHeaders,
    });
    if (!res.ok) {
      toast.error("Erro ao carregar permissões da equipe.");
      return;
    }
    set_selected_equipe_id(id);
    set_equipe_tela_ids((await res.json()).tela_ids);
  };

  const toggle_tela = (tela_id: number) => {
    set_equipe_tela_ids((atual) =>
      atual.includes(tela_id)
        ? atual.filter((id) => id !== tela_id)
        : [...atual, tela_id],
    );
  };

  const salva_permissoes = async () => {
    if (selected_equipe_id == null) return;

    const res = await fetch(`${API}/equipe/${selected_equipe_id}/telas`, {
      method: "PUT",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ tela_ids: equipe_tela_ids }),
    });

    if (res.ok) toast.success("Permissões atualizadas!");
    else toast.error("Erro ao salvar permissões.");
  };

  const criar_equipe = async () => {
    if (!nova_equipe_nome.trim()) {
      toast.error("Informe o nome da equipe.");
      return;
    }

    const res = await fetch(`${API}/equipe/criar`, {
      method: "POST",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nova_equipe_nome,
        descricao: nova_equipe_descricao,
      }),
    });

    if (res.ok) {
      toast.success("Equipe criada!");
      set_nova_equipe_nome("");
      set_nova_equipe_descricao("");
      carregar_equipes();
    } else {
      toast.error("Erro ao criar equipe.");
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
        set_telas((await tl.json()).telas);
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
          <CardTitle>Equipes &amp; Permissões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Equipes</Label>
            <div className="flex flex-wrap gap-2">
              {equipes.map((e) => (
                <Button
                  key={e.ID}
                  variant={selected_equipe_id === e.ID ? "default" : "outline"}
                  onClick={() => selecionar_equipe(e.ID)}
                  className={cn(
                    "border",
                    selected_equipe_id === e.ID
                      ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                      : "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white",
                  )}
                >
                  {e.NOME}
                </Button>
              ))}
            </div>
          </div>

          {selected_equipe_id != null && (
            <div className="space-y-2 border-t border-gray-700 pt-4">
              <Label>Telas que esta equipe tem acesso</Label>
              <div
                className="grid grid-cols-2 gap-2 pr-1"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {telas.map((t) => (
                  <div key={t.ID} className="flex items-center gap-2">
                    <Checkbox
                      id={`tela-${t.ID}`}
                      checked={equipe_tela_ids.includes(t.ID)}
                      onCheckedChange={() => toggle_tela(t.ID)}
                    />
                    <Label
                      htmlFor={`tela-${t.ID}`}
                      className="cursor-pointer font-normal text-sm"
                    >
                      {t.NOME}
                    </Label>
                  </div>
                ))}
              </div>
              <Button
                onClick={salva_permissoes}
                variant="outline"
                className="w-full border-gray-700 hover:bg-gray-700 hover:border-gray-400"
              >
                Salvar permissões
              </Button>
            </div>
          )}
          <div className="space-y-2 border-t border-gray-700 pt-4">
            <Label>Nova Equipe</Label>
            <Input
              value={nova_equipe_nome}
              onChange={(ev) => set_nova_equipe_nome(ev.target.value)}
              placeholder="Nome"
              className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            />
            <Input
              value={nova_equipe_descricao}
              onChange={(ev) => set_nova_equipe_descricao(ev.target.value)}
              placeholder="Descrição"
              className="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            />
            <Button
              onClick={criar_equipe}
              variant="outline"
              className="w-full border-gray-700 hover:bg-gray-700 hover:border-gray-400"
            >
              Criar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Equipes;
