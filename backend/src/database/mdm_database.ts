import oracledb, { Pool } from "oracledb";
import "dotenv/config";

interface TestResult {
  SOMA: number;
}

class OracleDatabase {
  static pool: Pool;

  static async initPool() {
    if (this.pool) return;

    this.pool = await oracledb.createPool({
      user: process.env.MDM_USER,
      password: process.env.MDM_PASSWORD,
      connectString: process.env.MDM_CONNECT_STRING,
      poolMin: 5,
      poolMax: 20,
      poolIncrement: 5,
    });

    console.log("Pool criada.");
  }

  public static async getConnection(): Promise<oracledb.Connection> {
    if (!this.pool) {
      throw new Error("Conexão não iniciada.");
    }

    return this.pool.getConnection();
  }

  static async testConnection() {
    const conn = await this.getConnection();

    const result = await conn.execute("select 1 + 1 as soma from dual", [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    if (!result.rows) return;

    const rsltObj = result.rows[0] as TestResult;

    console.log(rsltObj.SOMA);
  }
}

export default OracleDatabase;
