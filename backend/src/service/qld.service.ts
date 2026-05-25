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

  public async update(
    sql: string,
    params: Record<string, any> = {},
    expected_rows: number | null = null,
  ): Promise<number> {
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
      return rowsAffected;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.close();
    }
  }
}

export default QLDService;
