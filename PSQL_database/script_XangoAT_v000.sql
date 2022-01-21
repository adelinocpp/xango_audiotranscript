SET timezone = 'America/Sao_Paulo';
SET timezone = 'UTC';
--ALTER USER adelino WITH PASSWORD '@WSX1qaz';
--ALTER USER adelino WITH SUPERUSER;
--REASSIGN OWNED BY xango_web_user TO postgres; 
--REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM xango_web_user;
--REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM xango_web_user;
--REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM xango_web_user;
--DROP USER xango_web_user;
--CREATE USER xango_web_user WITH PASSWORD '@WSX1qaz';
-- ============================================================================
--   FUNCAO DATA DE ATUALIZACAO
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_date()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
    BEGIN
        NEW.updated = NOW();
        RETURN NEW;
    END;
  $function$
;
-- ============================================================================
--  TABELA DE EVENTOS
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    access_keys_id INTEGER,
    event_name VARCHAR(256),
    active_record BOOLEAN NOT NULL DEFAULT TRUE,
	created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated TIMESTAMPTZ,
  	completed TIMESTAMPTZ
);
-- trigger
create trigger set_timestamp before
update
    on
    public.events for each row execute procedure update_date();
-- Eventos cadastrados (ROTAS DO BACKEND)
INSERT INTO events (event_name,access_keys_id) VALUES ('/status',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/front_end_prefix',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/check_token',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/tables',-1);
--INSERT INTO events (event_name,access_keys_id) VALUES ('/list_table',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/encript',-1);
-- INSERT INTO events (event_name) VALUES ('/list_table_by_user');
INSERT INTO events (event_name,access_keys_id) VALUES ('/search_on_table',-1);
-- INSERT INTO events (event_name) VALUES ('/search_on_table_by_user');
INSERT INTO events (event_name,access_keys_id) VALUES ('/login',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/access',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/signup',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/recovery_password',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/captcha',-1);
-- INSERT INTO events (event_name) VALUES ('/request_verify_user');
-- INSERT INTO events (event_name) VALUES ('/verify_user');
INSERT INTO events (event_name,access_keys_id) VALUES ('/close_account',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/send_file',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/files',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/audio',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/request_transcrip',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/get_token_transcript',-1);
INSERT INTO events (event_name,access_keys_id) VALUES ('/return_transcrip',-1);

--INSERT INTO user_privilege (admimname,email,admimpw,pwneedupdate) VALUES ('adelinocpp','adelinocpp@gmail.com','5021fd108014fa9cfff353830a2e21d9f2edaaf7133f20760b6a48a551b02b09',false);
--UPDATE admim.users_admim SET verify=true WHERE admimname= 'adelinocpp';

-- ============================================================================
-- TABELAS PARA USUARIOS
CREATE TABLE access_keys (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(256),
    email VARCHAR(256),
    access_key VARCHAR(256) UNIQUE,
    active_record BOOLEAN NOT NULL DEFAULT TRUE,
	created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated TIMESTAMPTZ,
  	completed TIMESTAMPTZ
);
-- trigger
create trigger set_timestamp before
update
    on
    public.access_keys for each row execute procedure update_date();
INSERT INTO access_keys (user_name, email,access_key,updated,completed) VALUES ('0dbd9e48ed80f87391dc8adf9977a3e5', 'f65db401acf9d030048d4f62257b65b701036351186fa48cae70e6f9583ada4c', 'f150f2c84051d7a329fcd9f3df7dcad8', NOW(), NOW());
-- ============================================================================
-- TABELA LOGS
CREATE TABLE log_events (
    id SERIAL PRIMARY KEY,
    event_id INTEGER,
    access_keys_id INTEGER,
    active_record BOOLEAN NOT NULL DEFAULT TRUE,
    details JSON,
    details_version INTEGER NOT NULL,
	created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  	completed TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    FOREIGN KEY (event_id) REFERENCES public.events (id)
);
-- trigger
create trigger set_timestamp before
update
    on
    public.log_events for each row execute procedure update_date();
-- ============================================================================
-- TABELA DE ARQUIVOS
CREATE TABLE audio_file (
    id SERIAL PRIMARY KEY,
    access_keys_id INTEGER,
    audio_metadata JSON,
    hash_md5 VARCHAR(512),
    file_full_path VARCHAR(4096),
    audio_tags TEXT[],
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    active_record BOOLEAN NOT NULL DEFAULT TRUE,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	completed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (access_keys_id) REFERENCES public.access_keys (id)
);
-- trigger
create trigger set_timestamp before
update
    on
    public.audio_file for each row execute procedure update_date();
-- ============================================================================
-- TABELA DE DOWNLOADS
CREATE TABLE download_file (
    id SERIAL PRIMARY KEY,
    access_keys_id INTEGER,
    hash_md5 VARCHAR(512),
    file_full_path VARCHAR(4096),
    audio_ids TEXT[],
    active_record BOOLEAN NOT NULL DEFAULT TRUE,
    on_download BOOLEAN NOT NULL DEFAULT TRUE,
    created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	completed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (access_keys_id) REFERENCES public.access_keys (id)
);
-- trigger
create trigger set_timestamp before
update
    on
    public.download_file for each row execute procedure update_date();
-- ============================================================================
-- TABELA DE TRANSCRICOES
CREATE TABLE transcript_file (
    id SERIAL PRIMARY KEY,
    access_keys_id INTEGER,
    audio_file_id INTEGER,
    hash_md5 VARCHAR(512),
    file_full_path VARCHAR(4096),
    active_record BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(32) DEFAULT 'RUNNING',
--RUNNING
--SUCCESS
--FAILED_ACCESS
--FAILED_RUN
--FAILED_TRANSCRIPT
    requested TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated TIMESTAMPTZ,
  	completed TIMESTAMPTZ,
    FOREIGN KEY (access_keys_id) REFERENCES public.access_keys (id),
    FOREIGN KEY (audio_file_id) REFERENCES public.audio_file (id)
);
-- trigger
create trigger set_timestamp before
update
    on
    public.transcript_file for each row execute procedure update_date();
-- ============================================================================
-- CREATE VIEW view_transcript_audio AS SELECT nome_func, profissao, entrada, hora_entrada FROM audio_file, registro_ponto WHERE funcionarios.codigo = registro_ponto."codFunc";

-- ============================================================================
--GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO audiocfl_web_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO xango_web_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO xango_web_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO xango_web_user;
-- ============================================================================
-- VERIFICAR ESTES PRIVILEGIOS
REVOKE INSERT, UPDATE, DELETE ON public.events FROM xango_web_user;
REVOKE UPDATE, DELETE ON public.log_events FROM xango_web_user;
