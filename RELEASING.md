# Guia de Release

## Pré-requisitos (configurar uma vez na máquina)

```powershell
[System.Environment]::SetEnvironmentVariable("GH_TOKEN", "seu_token", "User")
[System.Environment]::SetEnvironmentVariable("CSC_IDENTITY_AUTO_DISCOVERY", "false", "User")
```

## Estratégia de branches

| Branch   | Propósito                           |
|----------|-------------------------------------|
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

### 3. Mandar para HML (equipe testar)

```sh
git checkout hml
git merge dev-nome-da-feature
npm version prerelease --preid=beta   # ex: 1.1.0 → 1.1.1-beta.0
bun run dist:hml
```

### 4. Aprovado → publicar PRD

```sh
git checkout master
git merge dev-nome-da-feature
npm version patch    # correção de bug:     1.1.0 → 1.1.1
# ou
npm version minor    # nova funcionalidade: 1.1.0 → 1.2.0
bun run dist:prd
```

## Convenção de versão

| Mudança              | Comando                                | Resultado             |
|----------------------|----------------------------------------|-----------------------|
| Correção de bug      | `npm version patch`                    | 1.1.0 → 1.1.1         |
| Nova funcionalidade  | `npm version minor`                    | 1.1.0 → 1.2.0         |
| Mudança estrutural   | `npm version major`                    | 1.1.0 → 2.0.0         |
| Build de teste (HML) | `npm version prerelease --preid=beta`  | 1.1.0 → 1.1.1-beta.0  |

## Observações

- O `npm version` exige working directory limpo. Commita tudo antes.
- O `dist:prd` publica uma release **estável** no GitHub — usuários PRD atualizam automaticamente.
- O `dist:hml` publica como **pre-release** — só apps HML recebem a atualização.
- Nunca faça merge de `hml` para `master`. O merge sempre vai de `dev-*` para `master` diretamente.
