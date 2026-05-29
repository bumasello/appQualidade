import OracleDB from "oracledb";
import MDMDatabase from "../database/mdm_database";
import { AppError } from "../error/appError";

class MDMService {
  public async query<T>(
    sql: string,
    params: Record<string, any> = {},
  ): Promise<T[]> {
    const conn = await MDMDatabase.getConnection();

    try {
      const result = await conn.execute(sql, params, {
        outFormat: OracleDB.OUT_FORMAT_OBJECT,
      });

      return (result.rows ?? []) as T[];
    } finally {
      conn.close();
    }
  }

  public async update(
    sql: string,
    params: Record<string, any> = {},
    expected_rows: number | null = null,
  ): Promise<{ success: boolean; rows_affected: number }> {
    const conn = await MDMDatabase.getConnection();

    try {
      const result = await conn.execute(sql, params, { autoCommit: false });
      const rows_affected = result.rowsAffected ?? 0;

      if (expected_rows !== null && rows_affected !== expected_rows) {
        throw new AppError(
          `Esperado ${expected_rows} linha(s) afetada(s), mas ${rows_affected} foram afetadas.`,
          400,
        );
      }

      await conn.commit();
      return { success: true, rows_affected: rows_affected };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.close();
    }
  }

  public async insert(
    sql: string,
    params: Record<string, any> = {},
    expected_rows: number | null = null,
  ) {
    const conn = await MDMDatabase.getConnection();

    try {
      const result = await conn.execute(sql, params, { autoCommit: false });
      const rows_affected = result.rowsAffected ?? 0;
      const row_id = result.lastRowid ?? null;

      if (expected_rows !== null && rows_affected !== expected_rows) {
        throw new AppError(
          `Esperado ${expected_rows} linha(s) afetada(s), mas ${rows_affected} foram afetadas.`,
          400,
        );
      }

      await conn.commit();
      if (rows_affected === 1) {
        return {
          success: true,
          rows_affected: rows_affected,
          row_id: row_id,
        };
      }
      return {
        success: true,
        rows_affected: rows_affected,
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.close();
    }
  }
}

export default MDMService;
