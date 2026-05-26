import oracledb from "oracledb";
import mdm_database from "../database/mdm_database";
import { User } from "../model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface UserCredentials {
  username: string;
  pass: string;
  nome_completo: string;
  email: string;
}

class UserService {
  public async loginUser(data: Pick<UserCredentials, "username" | "pass">) {
    const user = new User(data.username, data.pass);

    const conn = await mdm_database.getConnection();

    try {
      const consulta_user = await conn.execute(
        `select username, PASSWORD from ${process.env.MDM_TBL_USUARIOS} where username = :username`,
        { username: user.username },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      if (!consulta_user.rows) {
        return {
          success: false,
          message: "Usuário não encontrado!",
        };
      }

      const { USERNAME, PASSWORD } = consulta_user.rows[0] as {
        USERNAME: string;
        PASSWORD: string;
      };

      const ok = await bcrypt.compare(user.pass, PASSWORD);

      if (!ok) {
        return {
          success: false,
          message: "Credenciais inválidas!",
        };
      }

      const token = jwt.sign({ USERNAME }, process.env.JWT_SECRET!, {
        expiresIn: "8h",
      });

      return {
        success: true,
        message: "Login bem sucedido!",
        token: token,
      };
    } catch (error) {
      throw new Error(`[loginUser] Erro ao realizar login. ${error}`);
    } finally {
      await conn.close();
    }
  }

  public async createUser(data: UserCredentials) {
    const { nome_completo, username, pass, email } = data;
    const conn = await mdm_database.getConnection();

    try {
      const consulta_user = await conn.execute(
        `select username from ${process.env.MDM_TBL_USUARIOS} where username = :username`,
        { username: username },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      if (consulta_user.rows && consulta_user.rows.length > 0) {
        return {
          success: false,
          message: "Usuário já cadastrado!",
        };
      }

      const hashedPass = await bcrypt.hash(pass, 10);

      const result = await conn.execute(
        `INSERT INTO ${process.env.MDM_TBL_USUARIOS}
            (id, nome_completo, username, password, email, data_criacao, primeiro_acesso)
          VALUES
            (${process.env.MDM_SEQ_USUARIOS}.NEXTVAL, :nome_completo, :username, :pass, :email, SYSDATE, 0)`,
        {
          nome_completo: nome_completo,
          username: username,
          pass: hashedPass,
          email: email,
        },
        { autoCommit: true },
      );
      if (
        result.rowsAffected &&
        result.rowsAffected > 0 &&
        result.rowsAffected < 2
      ) {
        return {
          success: true,
          message: "Usuário criado!",
        };
      }
      return {
        success: false,
        message: "Nenhum registro afetado!",
      };
    } catch (error) {
      console.error("[createUser] Erro ao criar usuário!", error);
      throw new Error("Erro ao criar usuário!");
    } finally {
      await conn.close();
    }
  }
}

export default UserService;
