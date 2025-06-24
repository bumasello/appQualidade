import oracledb, { Pool } from "oracledb";
import "dotenv/config";

interface TestResult {
  SOMA: number;
}

class OracleDatabase {
  static pool: Pool;

  static async initPool() {
    const libDir = process.env.ORACLE_CLIENT_LIB_DIR;

    // if (!libDir) {
    //   console.error("Variável de ambiente ORACLE_CLIENT_LIB_DIR não definida.");
    //   // Lide com este erro, talvez lançando uma exceção ou saindo
    //   throw new Error("ORACLE_CLIENT_LIB_DIR not set.");
    // }

    oracledb.initOracleClient({
      libDir: libDir,
    });

    if (!this.pool) {
      this.pool = await oracledb.createPool({
        user: "mdm_usr",
        password: "mdmusr123",
        connectString: "10.243.3.23:1521/MDMFOHML",
        poolMin: 5,
        poolMax: 20,
        poolIncrement: 5,
      });

      console.log("Pool criada.");
    }
  }

  static async getConnection(): Promise<oracledb.Connection> {
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
