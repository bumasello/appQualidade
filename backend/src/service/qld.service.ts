import OracleDB from "oracledb";
import QLDDatabase from "../database/qld_database";
import { AppError } from "../error/appError";

class QLDService {
  public async query<T>(
    sql: string,
    params: Record<string, any> = {},
  ): Promise<T[]> {
    const conn = await QLDDatabase.getConnection();

    try {
      const result = await conn.execute(sql, params, {
        outFormat: OracleDB.OUT_FORMAT_OBJECT,
      });

      return (result.rows ?? []) as T[];
    } finally {
      conn.close();
    }
  }

  public async update<T = Record<string, any>>(
    sql: string,
    params: Record<string, any> = {},
    expected_rows: number | null = null,
  ): Promise<{ rowsAffected: number; out_bind: T }> {
    const conn = await QLDDatabase.getConnection();

    try {
      const result = await conn.execute(sql, params, { autoCommit: false });
      const rowsAffected = result.rowsAffected ?? 0;

      if (expected_rows !== null && rowsAffected !== expected_rows) {
        throw new AppError(
          `Esperado ${expected_rows} linha(s) afetada(s), mas ${rowsAffected} foram afetadas.`,
          400,
        );
      }

      await conn.commit();
      return {
        rowsAffected,
        out_bind: (result.outBinds ?? {}) as T,
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.close();
    }
  }

  public async insert_many(
    sql: string,
    rows: Record<string, any>[],
    options: { batch_size?: number; bind_defs?: Record<string, any> } = {},
  ): Promise<number> {
    const { batch_size = 1000, bind_defs } = options;

    if (rows.length === 0) return 0;

    const conn = await QLDDatabase.getConnection();
    let total = 0;

    try {
      for (let i = 0; i < rows.length; i += batch_size) {
        const batch = rows.slice(i, i + batch_size);
        const result = await conn.executeMany(sql, batch, {
          autoCommit: false,
          bindDefs: bind_defs,
        });

        total += result.rowsAffected ?? 0;
      }

      await conn.commit();
      return total;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.close();
    }
  }
}

export default QLDService;
