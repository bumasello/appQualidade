import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import oracledb from "oracledb";
import mdm_database from "../database/mdm_database";
import { AppError } from "../error/appError";
import { User } from "../model/user.model";
import MDMService from "./mdm.service";

interface UserCredentials {
  username: string;
  pass: string;
  nome_completo: string;
  email: string;
  equipe_id: number;
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
      const consulta_user = await this.mdm_service.query(
        `
        SELECT 
          u.ID, u.USERNAME, u.NOME_COMPLETO, u.PASSWORD, u.PRIMEIRO_ACESSO, u.EQUIPE_ID, u.ATIVO, e.NOME as EQUIPE_NOME
        FROM 
          ${process.env.MDM_TBL_USUARIOS} u
        LEFT JOIN
          ${process.env.MDM_TBL_EQUIPES} e ON
            e.ID = u.EQUIPE_ID
        WHERE 
          username = :username`,
        { username: user.username },
      );

      if (consulta_user.length === 0) {
        return {
          success: false,
          message: "Usuário não encontrado!",
        };
      }

      const {
        ID,
        USERNAME,
        NOME_COMPLETO,
        PASSWORD,
        PRIMEIRO_ACESSO,
        EQUIPE_ID,
        EQUIPE_NOME,
        ATIVO,
      } = consulta_user[0] as {
        ID: string;
        USERNAME: string;
        NOME_COMPLETO: string;
        PASSWORD: string;
        PRIMEIRO_ACESSO: string;
        EQUIPE_ID: string | null;
        EQUIPE_NOME: string | null;
        ATIVO: number;
      };

      const ok = await bcrypt.compare(user.pass, PASSWORD);

      if (!ok) {
        return {
          success: false,
          message: "Credenciais inválidas!",
        };
      }

      if (ATIVO === 0) {
        return {
          success: false,
          message: "Usuário inativo. Contate o gestor.",
        };
      }

      let telas: string[] = [];

      if (EQUIPE_ID != null) {
        const consulta_telas = await this.mdm_service.query(
          `
          SELECT 
            t.CHAVE
          FROM
            ${process.env.MDM_TBL_EQUIPE_TELA} et
          JOIN
            ${process.env.MDM_TBL_TELAS} t ON
              t.ID = et.TELA_ID
          WHERE
            et.EQUIPE_ID = :equipe_id and t.ATIVO = 1
          `,
          { equipe_id: EQUIPE_ID },
        );

        telas = (consulta_telas ?? []).map(
          (row) => (row as { CHAVE: string }).CHAVE,
        );
      }
      const token = jwt.sign(
        {
          user_id: Number(ID),
          user_name: USERNAME,
          equipe_id: EQUIPE_ID,
          equipe_nome: EQUIPE_NOME,
        },
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
        equipe: EQUIPE_ID != null ? { id: EQUIPE_ID, nome: EQUIPE_NOME } : null,
        telas: telas,
      };
    } catch (error) {
      throw new Error(`[loginUser] Erro ao realizar login. ${error}`);
    } finally {
      await conn.close();
    }
  }

  public async create_user(
    data: Pick<
      UserCredentials,
      "username" | "email" | "nome_completo" | "equipe_id"
    >,
  ) {
    const { nome_completo, username, email, equipe_id } = data;
    const conn = await mdm_database.getConnection();

    const pass = email.split("@")[0];

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
            (id, nome_completo, username, password, email, data_criacao, primeiro_acesso, equipe_id)
          VALUES
            (${process.env.MDM_SEQ_USUARIOS}.NEXTVAL, :nome_completo, :username, :pass, :email, SYSDATE, 1, :equipe_id)`,
        {
          nome_completo: nome_completo,
          username: username,
          pass: hashedPass,
          email: email,
          equipe_id: equipe_id,
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
          pass: pass,
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
      if (error instanceof AppError) throw error;
      console.error("[resetPassword] Erro ao resetar a senha do usuário!", error);
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

  public async listar() {
    return this.mdm_service.query(
      `
      SELECT 
        u.ID, u.NOME_COMPLETO, u.USERNAME, u.EQUIPE_ID, e.NOME as EQUIPE_NOME, u.ATIVO
      FROM
        ${process.env.MDM_TBL_USUARIOS} u
      LEFT JOIN
        ${process.env.MDM_TBL_EQUIPES} e ON
          e.ID = u.EQUIPE_ID
      ORDER BY
        u.NOME_COMPLETO
      `,
    );
  }

  public async definir_equipe(user_id: number, equipe_id: number) {
    return this.mdm_service.update(
      `
      UPDATE
        ${process.env.MDM_TBL_USUARIOS}
      SET
        EQUIPE_ID = :equipe_id
      WHERE
        ID = :user_id
      `,
      { user_id, equipe_id },
      1,
    );
  }

  public async equipe_atual(user_id: number): Promise<number | null> {
    const rows = await this.mdm_service.query<{ EQUIPE_ID: number | null }>(
      `SELECT 
        EQUIPE_ID
      FROM 
        ${process.env.MDM_TBL_USUARIOS} 
      WHERE 
        ID = :user_id`,
      { user_id },
    );
    return rows[0]?.EQUIPE_ID ?? null;
  }

  public async definir_status(user_id: number, ativo: number) {
    return this.mdm_service.update(
      `UPDATE 
        ${process.env.MDM_TBL_USUARIOS} 
      SET 
        ATIVO = :ativo
      WHERE 
        ID = :user_id`,
      { user_id, ativo },
      1,
    );
  }
}

export default UserService;
