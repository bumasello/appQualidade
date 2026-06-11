CREATE TABLE mdm_usr.usuario_app_qualidade (
  id              NUMBER         PRIMARY KEY,
  nome_completo   VARCHAR2(150)  NOT NULL,
  username        VARCHAR2(60)   NOT NULL,
  password        VARCHAR2(100)  NOT NULL,
  email           VARCHAR2(150)  NOT NULL,
  data_criacao    DATE           DEFAULT SYSDATE NOT NULL,
  primeiro_acesso NUMBER(1)      DEFAULT 0 NOT NULL,
  CONSTRAINT uq_usuario_username UNIQUE (username)
);

CREATE SEQUENCE mdm_usr.usuario_app_qualidade_seq START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE mdm_usr.auditoria_app_qualidade (
  id            NUMBER         PRIMARY KEY,
  usuario_id    NUMBER,
  usuario_nome  VARCHAR2(100),
  acao          VARCHAR2(50),
  tabela        VARCHAR2(100),
  payload       CLOB,
  estado_antes  CLOB,
  criado_em     TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE mdm_usr.auditoria_app_qualidade_seq START WITH 1 INCREMENT BY 1 NOCACHE;
