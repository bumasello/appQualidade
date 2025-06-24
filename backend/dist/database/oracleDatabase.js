"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oracledb_1 = __importDefault(require("oracledb"));
require("dotenv/config");
class OracleDatabase {
    static pool;
    static async initPool() {
        const libDir = process.env.ORACLE_CLIENT_LIB_DIR;
        // if (!libDir) {
        //   console.error("Variável de ambiente ORACLE_CLIENT_LIB_DIR não definida.");
        //   // Lide com este erro, talvez lançando uma exceção ou saindo
        //   throw new Error("ORACLE_CLIENT_LIB_DIR not set.");
        // }
        oracledb_1.default.initOracleClient({
            libDir: libDir,
        });
        if (!this.pool) {
            this.pool = await oracledb_1.default.createPool({
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
    static async getConnection() {
        if (!this.pool) {
            throw new Error("Conexão não iniciada.");
        }
        return this.pool.getConnection();
    }
    static async testConnection() {
        const conn = await this.getConnection();
        const result = await conn.execute("select 1 + 1 as soma from dual", [], {
            outFormat: oracledb_1.default.OUT_FORMAT_OBJECT,
        });
        if (!result.rows)
            return;
        const rsltObj = result.rows[0];
        console.log(rsltObj.SOMA);
    }
}
exports.default = OracleDatabase;
