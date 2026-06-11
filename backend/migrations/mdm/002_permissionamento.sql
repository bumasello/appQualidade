CREATE TABLE mdm_usr.equipe_app_qualidade (
  id           NUMBER        PRIMARY KEY,
  nome         VARCHAR2(60)  NOT NULL,
  descricao    VARCHAR2(200),
  ativo        NUMBER(1)     DEFAULT 1 NOT NULL,
  data_criacao DATE          DEFAULT SYSDATE NOT NULL,
  CONSTRAINT uq_equipe_nome UNIQUE (nome)
);
CREATE SEQUENCE mdm_usr.equipe_app_qualidade_seq START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE mdm_usr.tela_app_qualidade (
  id        NUMBER        PRIMARY KEY,
  chave     VARCHAR2(60)  NOT NULL,
  nome      VARCHAR2(80)  NOT NULL,
  descricao VARCHAR2(200),
  ativo     NUMBER(1)     DEFAULT 1 NOT NULL,
  CONSTRAINT uq_tela_chave UNIQUE (chave)
);
CREATE SEQUENCE mdm_usr.tela_app_qualidade_seq START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE mdm_usr.equipe_tela_app_qualidade (
  equipe_id NUMBER NOT NULL,
  tela_id   NUMBER NOT NULL,
  CONSTRAINT pk_equipe_tela PRIMARY KEY (equipe_id, tela_id),
  CONSTRAINT fk_et_equipe FOREIGN KEY (equipe_id) REFERENCES mdm_usr.equipe_app_qualidade (id),
  CONSTRAINT fk_et_tela   FOREIGN KEY (tela_id)   REFERENCES mdm_usr.tela_app_qualidade (id)
);

ALTER TABLE mdm_usr.usuario_app_qualidade ADD (equipe_id NUMBER);
ALTER TABLE mdm_usr.usuario_app_qualidade ADD CONSTRAINT fk_usuario_equipe FOREIGN KEY (equipe_id) REFERENCES mdm_usr.equipe_app_qualidade (id);

INSERT INTO mdm_usr.equipe_app_qualidade (id, nome, descricao) VALUES (mdm_usr.equipe_app_qualidade_seq.NEXTVAL, 'gestão', 'Acesso total: administra usuários, equipes e telas');

INSERT INTO mdm_usr.tela_app_qualidade (id, chave, nome, descricao) VALUES (mdm_usr.tela_app_qualidade_seq.NEXTVAL, 'vinculo-profissional', 'Vínculo Profissional', 'Vínculo de profissionais de saúde');
INSERT INTO mdm_usr.tela_app_qualidade (id, chave, nome, descricao) VALUES (mdm_usr.tela_app_qualidade_seq.NEXTVAL, 'repl-curriculo-prf', 'Repl. Currículo Onco', 'Replicação de currículo de profissionais');
INSERT INTO mdm_usr.tela_app_qualidade (id, chave, nome, descricao) VALUES (mdm_usr.tela_app_qualidade_seq.NEXTVAL, 'comparador-planilhas', 'Comparador de Planilhas', 'Utilitário de comparação de planilhas');
INSERT INTO mdm_usr.tela_app_qualidade (id, chave, nome, descricao) VALUES (mdm_usr.tela_app_qualidade_seq.NEXTVAL, 'configuracoes', 'Configurações', 'Administração de permissionamento (somente gestão)');

INSERT INTO mdm_usr.equipe_tela_app_qualidade (equipe_id, tela_id) SELECT e.id, t.id FROM mdm_usr.equipe_app_qualidade e CROSS JOIN mdm_usr.tela_app_qualidade t WHERE e.nome = 'gestão';
