import { createHash } from "crypto";
import { config } from "dotenv";
import { readdirSync, readFileSync } from "fs";
import OracleDB from "oracledb";
import { join } from "path";

const APP_ENV = process.env.APP_ENV;
const DRY_RUN = process.argv.includes("--dry-run");
const BASELINE = (() => {
  const i = process.argv.indexOf("--baseline");
  return i >= 0 ? Number(process.argv[i + 1]) : null;
})();

if (!APP_ENV) {
  console.error("APP_ENV é obrigatório. Ex: APP_ENV=hml bun run migrate");
  process.exit(1);
}

config({ path: join(process.cwd(), `.env.${APP_ENV}`) });
OracleDB.initOracleClient({ libDir: process.env.ORACLE_CLIENT_LIB_DIR });

const DATABASES = [
  {
    nome: "MDM",
    dir: join(process.cwd(), "backend/migrations/mdm"),
    conn: {
      user: process.env.MDM_USER!,
      password: process.env.MDM_PASSWORD!,
      connectString: process.env.MDM_CONNECT_STRING!,
    },
  },
  {
    nome: "QLD",
    dir: join(process.cwd(), "backend/migrations/qld"),
    conn: {
      user: process.env.QLD_USER!,
      password: process.env.QLD_PASSWORD!,
      connectString: process.env.QLD_CONNECT_STRING!,
    },
  },
];

interface Migration {
  versao: number;
  nome: string;
  conteudo: string;
  checksum: string;
}

async function aplicar_baseline(
  conn: OracleDB.Connection,
  db: (typeof DATABASES)[number],
  migrations: Migration[],
) {
  await garantir_tabela_controle(conn);
  const aplicadas = await migracoes_aplicadas(conn);

  for (const m of migrations) {
    if (m.versao > BASELINE!) continue;
    if (aplicadas.has(m.versao)) {
      console.log(`[${db.nome}] baseline: ${m.nome} já registrada.`);
      continue;
    }
    await conn.execute(
      `INSERT INTO schema_migrations (versao, nome, checksum)
       VALUES (:versao, :nome, :checksum)`,
      { versao: m.versao, nome: m.nome, checksum: m.checksum },
      { autoCommit: true },
    );
    console.log(
      `[${db.nome}] baseline: ${m.nome} marcada como aplicada (sem rodar).`,
    );
  }
}

function carregar_migrations(dir: string): Migration[] {
  let arquivos: string[];
  try {
    arquivos = readdirSync(dir).filter((f) => f.endsWith(".sql"));
  } catch {
    return [];
  }

  return arquivos
    .map((nome) => {
      const conteudo = readFileSync(join(dir, nome), "utf-8");
      return {
        versao: Number(nome.split("_")[0]),
        nome,
        conteudo,
        checksum: createHash("sha256").update(conteudo).digest("hex"),
      };
    })
    .sort((a, b) => a.versao - b.versao);
}

function separar_statement(sql: string): string[] {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function garantir_tabela_controle(conn: OracleDB.Connection) {
  try {
    await conn.execute(`
            CREATE TABLE schema_migrations (
        versao      NUMBER         NOT NULL,
        nome        VARCHAR2(200)  NOT NULL,
        checksum    VARCHAR2(64)   NOT NULL,
        aplicada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT pk_schema_migrations PRIMARY KEY (versao)
      )
            `);
    await conn.commit();
  } catch (error) {
    if ((error as { errorNum?: number }).errorNum !== 955) throw error;
  }
}

async function migracoes_aplicadas(
  conn: OracleDB.Connection,
): Promise<Map<number, string>> {
  const mapa = new Map<number, string>();
  try {
    const result = await conn.execute(
      `SELECT versao, checksum FROM schema_migrations`,
      [],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT },
    );
    for (const row of (result.rows ?? []) as {
      VERSAO: number;
      CHECKSUM: string;
    }[]) {
      mapa.set(row.VERSAO, row.CHECKSUM);
    }
  } catch (error) {
    if ((error as { errorNum?: number }).errorNum !== 942) throw error;
  }
  return mapa;
}

async function aplicar(conn: OracleDB.Connection, m: Migration) {
  try {
    for (const stmt of separar_statement(m.conteudo)) {
      await conn.execute(stmt, [], { autoCommit: false });
    }
    await conn.execute(
      `INSERT INTO schema_migrations (versao, nome, checksum)
       VALUES (:versao, :nome, :checksum)`,
      { versao: m.versao, nome: m.nome, checksum: m.checksum },
      { autoCommit: false },
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  }
}

async function migrar_banco(db: (typeof DATABASES)[number]) {
  const migrations = carregar_migrations(db.dir);
  if (migrations.length === 0) {
    console.log(`[${db.nome}] sem migrations.`);
    return;
  }

  const conn = await OracleDB.getConnection(db.conn);
  try {
    if (BASELINE !== null) {
      await aplicar_baseline(conn, db, migrations);
      return;
    }
    if (!DRY_RUN) await garantir_tabela_controle(conn);
    const aplicadas = await migracoes_aplicadas(conn);

    for (const m of migrations) {
      const checksum_aplicado = aplicadas.get(m.versao);

      if (checksum_aplicado !== undefined) {
        if (checksum_aplicado !== m.checksum) {
          throw new Error(
            `[${db.nome}] ${m.nome} foi MODIFICADA após aplicada (checksum diferente). ` +
              `Não edite migration aplicada — crie uma nova.`,
          );
        }
        console.log(`[${db.nome}] ${m.nome} — já aplicada, pulando.`);
        continue;
      }

      if (DRY_RUN) {
        console.log(`[${db.nome}] [dry-run] aplicaria ${m.nome}`);
        continue;
      }

      console.log(`[${db.nome}] aplicando ${m.nome}...`);
      await aplicar(conn, m);
      console.log(`[${db.nome}] ✓ ${m.nome}`);
    }
  } finally {
    await conn.close();
  }
}

(async () => {
  console.log(`=== migrate (APP_ENV=${APP_ENV}) ===`);
  for (const db of DATABASES) {
    await migrar_banco(db);
  }
  console.log("=== concluído ===");
  process.exit(0);
})().catch((err) => {
  console.error("✗ ERRO na migração:", (err as Error).message ?? err);
  process.exit(1);
});
