# Guia de Release

## Pré-requisitos (configurar uma vez na máquina)

```powershell
[System.Environment]::SetEnvironmentVariable("GH_TOKEN", "seu_token", "User")
[System.Environment]::SetEnvironmentVariable("CSC_IDENTITY_AUTO_DISCOVERY", "false", "User")
```

## Estratégia de branches

| Branch   | Propósito                           |
| -------- | ----------------------------------- |
| `master` | Código estável, fonte do PRD        |
| `hml`    | Staging — equipe testa aqui         |
| `dev-*`  | Desenvolvimento de features e fixes |

## Fluxo completo

### 1. Iniciar uma tarefa nova

```sh
git checkout master && git pull
git checkout -b dev-nome-da-feature
```

### 2. Desenvolver e commitar

```sh
git add <arquivos>
git commit -m "feat: descrição"
```

### 3. Testar local antes de subir

```sh
bun run dev:electron
```

Confirma que o app abre, o login funciona e a funcionalidade alterada se comporta como esperado. **Só avança para o HML depois de validar aqui.**

### 4. Mandar para HML (equipe testar)

```sh
git checkout hml
git merge dev-nome-da-feature
npm version prerelease --preid=beta   # ex: 1.1.0 → 1.1.1-beta.0
git push
git push --tags
bun run dist:hml
```

### 5. Aprovado → publicar PRD

```sh
git checkout master
git merge dev-nome-da-feature
npm version patch    # correção de bug:     1.1.0 → 1.1.1
# ou
npm version minor    # nova funcionalidade: 1.1.0 → 1.2.0
git push
git push --tags
bun run dist:prd
```

### 6. Sincronizar master → HML após o PRD

Sempre que o master receber um bump de versão (passo 5), sincronize de volta no HML para manter a base de versão alinhada:

```sh
git checkout hml
git merge master   # traz o bump de versão do PRD para o HML
git push
# não precisa de dist:hml — nenhuma feature nova, só alinhamento de versão
```

Sem esse passo, o próximo `npm version prerelease` no HML parte da versão antiga e gera um número errado (ex: `1.3.8-beta.2` em vez de `1.4.1-beta.0`).

### Sync master → hml (sem feature nova)

Quando há apenas correções de infra/build no master que precisam ir para o HML, **sem** work nova a ser testada — não faz bump de versão:

```sh
git checkout hml
git merge master
git push
bun run dist:hml
```

O bump (`npm version prerelease`) só acontece quando há feature nova entrando no HML para ser testada antes do PRD.

## Convenção de versão

| Mudança              | Comando                               | Resultado            |
| -------------------- | ------------------------------------- | -------------------- |
| Correção de bug      | `npm version patch`                   | 1.1.0 → 1.1.1        |
| Nova funcionalidade  | `npm version minor`                   | 1.1.0 → 1.2.0        |
| Mudança estrutural   | `npm version major`                   | 1.1.0 → 2.0.0        |
| Build de teste (HML) | `npm version prerelease --preid=beta` | 1.1.0 → 1.1.1-beta.0 |

## Convenção de mensagens de commit

Usamos o padrão **Conventional Commits** — o mais adotado no mercado e compatível com ferramentas de changelog automático.

### Formato

```
<tipo>(<escopo>): <descrição curta>
```

O `(<escopo>)` é opcional — indica a área afetada (ex: `backend`, `frontend`, `build`, `electron`).

### Tipos

| Tipo       | Quando usar                                          | Impacto na versão |
| ---------- | ---------------------------------------------------- | ----------------- |
| `feat`     | Nova funcionalidade para o usuário                   | `minor` (1.1.0)   |
| `fix`      | Correção de bug                                      | `patch` (1.0.1)   |
| `docs`     | Apenas documentação (README, RELEASING, comentários) | nenhum            |
| `refactor` | Refatoração sem mudar comportamento externo          | nenhum            |
| `chore`    | Manutenção: deps, configs, scripts de build          | nenhum            |
| `style`    | Formatação, espaços, ponto e vírgula — sem lógica    | nenhum            |
| `perf`     | Melhoria de performance                              | `patch`           |
| `ci`       | Mudanças em CI/CD                                    | nenhum            |

### Breaking change → major

Para mudanças que quebram compatibilidade, adiciona `!` após o tipo:

```
feat!: remove endpoint /user/create_user
```

Isso sinaliza `major` (1.0.0 → 2.0.0).

### Exemplos reais do projeto

```
feat(backend): adiciona serviço de replicação de currículo PRF
fix(electron): oculta janela do node.exe no Windows
fix(build): bundle backend com esbuild e inclui oracledb no pacote
chore: corrige publish hml e adiciona guia de release
docs: adiciona git push e push --tags no fluxo de release
refactor(backend): extrai QLDService e QLDDatabase como módulos separados
```

## Observações

- O `npm version` exige working directory limpo. Commita tudo antes.
- O `dist:prd` publica uma release **estável** no GitHub — usuários PRD atualizam automaticamente.
- O `dist:hml` publica como **pre-release** — só apps HML recebem a atualização.
- Nunca faça merge de `hml` para `master`. O merge sempre vai de `dev-*` para `master` diretamente.
