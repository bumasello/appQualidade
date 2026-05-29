import oracledb from "oracledb";
import mdm_database from "../database/mdm_database";
import { User } from "../model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import MDMService from "./mdm.service";
import { AppError } from "../error/appError";

interface UserCredentials {
  username: string;
  pass: string;
  nome_completo: string;
  email: string;
}

class UserService {
  private mdm_service: MDMService;

  constructor() {
    this.mdm_service = new MDMService();
  }

  public async login_user(data: Pick<UserCredentials, "username" | "pass">) {
    const user = new User(data.username, data.pass);

    const conn = await mdm_database.getConnection();

    try {
      const consulta_user = await conn.execute(
        `select ID, USERNAME, NOME_COMPLETO, PASSWORD, PRIMEIRO_ACESSO from ${process.env.MDM_TBL_USUARIOS} where username = :username`,
        { username: user.username },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      if (!consulta_user.rows) {
        return {
          success: false,
          message: "Usuário não encontrado!",
        };
      }

      const { ID, USERNAME, NOME_COMPLETO, PASSWORD, PRIMEIRO_ACESSO } =
        consulta_user.rows[0] as {
          ID: string;
          USERNAME: string;
          NOME_COMPLETO: string;
          PASSWORD: string;
          PRIMEIRO_ACESSO: string;
        };

      const ok = await bcrypt.compare(user.pass, PASSWORD);

      if (!ok) {
        return {
          success: false,
          message: "Credenciais inválidas!",
        };
      }

      const token = jwt.sign(
        { user_id: Number(ID), user_name: USERNAME },
        process.env.JWT_SECRET!,
        {
          expiresIn: "8h",
        },
      );

      return {
        success: true,
        message: "Login bem sucedido!",
        token: token,
        nome_completo: NOME_COMPLETO,
        primeiro_acesso: PRIMEIRO_ACESSO,
      };
    } catch (error) {
      throw new Error(`[loginUser] Erro ao realizar login. ${error}`);
    } finally {
      await conn.close();
    }
  }

  public async create_user(data: UserCredentials) {
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

  public async reset_password(
    data: Pick<UserCredentials, "username" | "pass">,
  ): Promise<{ success: true; EMAIL: string }> {
    const { username, pass } = data;

    try {
      const user_found = await this.mdm_service.query(
        `
      SELECT
        USERNAME, EMAIL FROM ${process.env.MDM_TBL_USUARIOS}
      WHERE
        USERNAME = :username
      `,
        { username: username },
      );

      if (user_found.length < 1)
        throw new AppError("Usuário não encontrado", 404);

      const { EMAIL } = user_found[0] as {
        USERNAME: string;
        EMAIL: string;
      };
      const hashedPass = await bcrypt.hash(pass, 10);

      await this.mdm_service.update(
        `
     UPDATE
      ${process.env.MDM_TBL_USUARIOS}
     SET
      PASSWORD = :hashpass,
      PRIMEIRO_ACESSO = 1
     WHERE
      USERNAME = :username
      `,
        {
          username: username,
          hashpass: hashedPass,
        },
        1,
      );

      return {
        success: true,
        EMAIL: EMAIL,
      };
    } catch (error) {
      console.error("[resetPassword] Erro ao resetar a senha do usuário!");
      throw new Error("Erro ao resetar a senha do usuário!");
    }
  }
  public async change_password(
    data: Pick<UserCredentials, "username" | "pass">,
  ): Promise<{ success: boolean; message: string }> {
    const { username, pass } = data;

    try {
      const hashedPass = await bcrypt.hash(pass, 10);

      await this.mdm_service.update(
        `
     UPDATE
      ${process.env.MDM_TBL_USUARIOS}
     SET
      PASSWORD = :hashedPass,
      PRIMEIRO_ACESSO = 0
     WHERE
      USERNAME = :username
      `,
        {
          username: username,
          hashedPass: hashedPass,
        },
        1,
      );

      return {
        success: true,
        message: "Senha alterada com sucesso",
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("[change_password] Erro ao mudar a senha do usuário!");
      throw new Error("Erro ao mudar a senha do usuário!");
    }
  }
}

export default UserService;
