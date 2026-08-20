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

> ⚠️ **A versão da beta precisa ANTECIPAR a versão que a mudança terá em PRD.**
> Se a beta ficar num número que um release estável de PRD possa alcançar, o app de
> HML "atualiza pra trás" pro PRD (que não tem a feature). Veja
> [Versionamento HML × PRD](#versionamento-hml--prd).

```sh
git checkout hml
git merge dev-nome-da-feature
```

O **primeiro** bump depende do tipo da mudança:

```sh
# 1ª beta de uma FEATURE → preminor (mesmo minor que o PRD vai receber)
npm version preminor --preid=beta    # 1.5.0 → 1.6.0-beta.0

# 1ª beta de um FIX → prepatch
npm version prepatch --preid=beta    # 1.5.0 → 1.5.1-beta.0
```

Betas **seguintes da mesma mudança** (ajustes durante o teste) só incrementam o contador:

```sh
npm version prerelease --preid=beta  # 1.6.0-beta.0 → 1.6.0-beta.1
```

```sh
git push && git push --tags
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

| Mudança                   | Comando                               | Resultado                   |
| ------------------------- | ------------------------------------- | --------------------------- |
| Correção de bug (PRD)     | `npm version patch`                   | 1.5.0 → 1.5.1               |
| Nova funcionalidade (PRD) | `npm version minor`                   | 1.5.0 → 1.6.0               |
| Mudança estrutural (PRD)  | `npm version major`                   | 1.5.0 → 2.0.0               |
| 1ª beta de feature (HML)  | `npm version preminor --preid=beta`   | 1.5.0 → 1.6.0-beta.0        |
| 1ª beta de fix (HML)      | `npm version prepatch --preid=beta`   | 1.5.0 → 1.5.1-beta.0        |
| Beta seguinte (HML)       | `npm version prerelease --preid=beta` | 1.6.0-beta.0 → 1.6.0-beta.1 |

## Versionamento HML × PRD

HML (`beta`) e PRD (`latest`) publicam **no mesmo repositório**, e o auto-updater trata os canais em hierarquia: **quem está em `beta` também recebe `latest`** (a ideia é que beta é o ensaio do próximo estável). Por semver, `1.6.0` > `1.6.0-beta.0`.

**Consequência:** se um release **estável** de PRD tiver um número **maior ou igual** à beta de HML em teste, os apps de HML **atualizam para o PRD** — perdendo as features que ainda não foram pra produção. Foi exatamente o que aconteceu com `1.5.1` (PRD) × `1.5.1-beta.x` (HML): a feature foi beta-testada como `1.5.1-beta` (patch), aí um `fix` de PRD virou `1.5.1` e "engoliu" os betas.

**Regra para evitar:** a beta de HML sempre antecipa a versão-alvo de PRD.

- Feature → beta em `X.(Y+1).0-beta.z`; o PRD vira `X.(Y+1).0` (mesmo minor) quando aprovado.
- Fix → beta em `X.Y.(Z+1)-beta.z`; o PRD vira `X.Y.(Z+1)`.

Assim a beta está **sempre à frente ou igual** ao que o PRD daquela mudança será — e o "upgrade" beta→estável só acontece quando o estável **de fato contém** o que a beta testou.

> ⚠️ Enquanto há uma **feature** em beta no HML (ex. `1.6.0-beta.x`), **não** publique um `minor` de PRD que alcance `1.6.0` sem incluir essa feature. Hotfixes de PRD (`patch`, ex. `1.5.1`) são seguros — ficam abaixo da beta.

**Conserto definitivo (melhoria futura):** separar os feeds — publicar as betas de HML num repositório dedicado (ex. `appqualidade-hml`). Aí o app de HML nunca enxerga release de PRD, e nem um erro de versão consegue cruzar os canais.

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
- **Só faça `git push --tags` quando o `dist` for rodar em seguida.** O electron-updater enxerga a tag no feed do GitHub e passa a considerá-la a versão mais nova; se não houver release publicada com os artefatos, todo app tenta baixar o `latest.yml` daquela tag e falha com 404 a cada start. Se a tag já foi publicada e o build vai demorar, tira ela do remoto até lá: `git push origin :refs/tags/vX.Y.Z` (a tag local continua intacta).
- O `dist:prd` publica uma release **estável** no GitHub — usuários PRD atualizam automaticamente.
- O `dist:hml` publica como **pre-release** — só apps HML recebem a atualização.
- HML e PRD compartilham o mesmo repo de releases → a versão da beta precisa **antecipar** a de PRD, senão o app de HML atualiza pra trás. Veja [Versionamento HML × PRD](#versionamento-hml--prd).
- Nunca faça merge de `hml` para `master`. O merge sempre vai de `dev-*` para `master` diretamente.
