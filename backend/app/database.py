from pathlib import Path
import sqlite3


DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "data" / "outros_creditos.db"


def connect(db_path: str | Path = DEFAULT_DB_PATH) -> sqlite3.Connection:
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


def init_db(db_path: str | Path = DEFAULT_DB_PATH) -> None:
    with connect(db_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS usuarios (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              usuario TEXT NOT NULL UNIQUE,
              senha TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS contas_correntes (
              numero TEXT PRIMARY KEY,
              titular TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS lotes (
              id_lote INTEGER PRIMARY KEY,
              data_entrada TEXT NOT NULL,
              valor REAL NOT NULL,
              quantidade_lancamentos INTEGER NOT NULL,
              usuario_registro TEXT NOT NULL,
              usuario_aprovacao TEXT NOT NULL,
              situacao_lote TEXT NOT NULL,
              data_hora_situacao_lote TEXT NOT NULL,
              instituicao_resp TEXT NOT NULL,
              instituicao TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS lancamentos (
              id_lancamento INTEGER PRIMARY KEY AUTOINCREMENT,
              id_lote INTEGER NOT NULL,
              pa TEXT NOT NULL,
              conta_corrente TEXT NOT NULL,
              titular TEXT NOT NULL,
              valor REAL NOT NULL,
              historico TEXT NOT NULL,
              estorno INTEGER NOT NULL,
              documento TEXT NOT NULL,
              descricao TEXT NOT NULL,
              situacao TEXT NOT NULL,
              situacao_documento_csc TEXT NOT NULL,
              retorno_proc TEXT NOT NULL,
              FOREIGN KEY (id_lote) REFERENCES lotes(id_lote)
            );
            """
        )
        seed_db(connection)


def seed_db(connection: sqlite3.Connection) -> None:
    if connection.execute("SELECT COUNT(*) FROM usuarios").fetchone()[0] > 0:
        return

    connection.execute("INSERT INTO usuarios (usuario, senha) VALUES (?, ?)", ("admin", "admin"))
    connection.executemany(
        "INSERT INTO contas_correntes (numero, titular) VALUES (?, ?)",
        [
            ("444444", "Iris Maria Costa"),
            ("555555", "Sicoob Cooperado Exemplo"),
            ("123456", "João Paulo Ferreira"),
        ],
    )
    connection.executemany(
        """
        INSERT INTO lotes (
          id_lote, data_entrada, valor, quantidade_lancamentos, usuario_registro,
          usuario_aprovacao, situacao_lote, data_hora_situacao_lote, instituicao_resp, instituicao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        [
            (
                2,
                "2026-04-26",
                1000,
                1,
                "gearco0300_00",
                "",
                "Aberto",
                "2026-04-27T12:35:11",
                "0001 - SICOOB",
                "0002 - SICOOB CENTRAL",
            ),
            (
                3,
                "2026-04-28",
                2480.35,
                2,
                "contab0180",
                "aprovador01",
                "Enviado",
                "2026-04-28T16:12:02",
                "0001 - SICOOB",
                "0002 - SICOOB CENTRAL",
            ),
            (
                4,
                "2026-05-02",
                740.5,
                1,
                "contab0220",
                "gerente02",
                "Confirmado",
                "2026-05-03T09:45:40",
                "0001 - SICOOB",
                "0004 - SICOOB NORTE",
            ),
        ],
    )
    connection.execute(
        """
        INSERT INTO lancamentos (
          id_lote, pa, conta_corrente, titular, valor, historico, estorno,
          documento, descricao, situacao, situacao_documento_csc, retorno_proc
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            2,
            "01",
            "444444",
            "Iris Maria Costa",
            1000,
            "Lançamento Manual",
            0,
            "8075",
            "Crédito manual inicial",
            "Pendente",
            "Pendente",
            "",
        ),
    )
