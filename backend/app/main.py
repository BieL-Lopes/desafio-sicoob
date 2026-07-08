from pathlib import Path
import sqlite3
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .database import DEFAULT_DB_PATH, connect, init_db


class LoginRequest(BaseModel):
    usuario: str
    senha: str


class LoginResponse(BaseModel):
    token: str
    usuario: str


class ContaCorrenteResponse(BaseModel):
    numero: str
    titular: str


class LancamentoRequest(BaseModel):
    pa: str = Field(min_length=1)
    contaCorrente: str = Field(min_length=1)
    titular: str = ""
    valor: float = Field(gt=0)
    historico: str = Field(min_length=1)
    estorno: bool = False
    documento: str = Field(min_length=1)
    descricao: str = ""
    situacao: str = "Pendente"
    situacaoDocumentoCsc: str = "Pendente"
    retornoProc: str = ""


def create_app(db_path: str | Path = DEFAULT_DB_PATH) -> FastAPI:
    init_db(db_path)
    app = FastAPI(title="Outros Créditos/Débitos API")
    app.state.db_path = db_path

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    def get_db() -> sqlite3.Connection:
        connection = connect(app.state.db_path)
        try:
            yield connection
        finally:
            connection.close()

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/auth/login", response_model=LoginResponse)
    def login(payload: LoginRequest, db: sqlite3.Connection = Depends(get_db)) -> dict[str, str]:
        usuario = db.execute(
            "SELECT usuario FROM usuarios WHERE usuario = ? AND senha = ?",
            (payload.usuario, payload.senha),
        ).fetchone()

        if not usuario:
            raise HTTPException(status_code=401, detail="Usuário ou senha inválidos.")

        return {"token": f"mock-token-{payload.usuario}", "usuario": payload.usuario}

    @app.get("/contas-correntes/{numero}", response_model=ContaCorrenteResponse)
    def buscar_conta(numero: str, db: sqlite3.Connection = Depends(get_db)) -> dict[str, Any]:
        conta = db.execute(
            "SELECT numero, titular FROM contas_correntes WHERE numero = ?",
            (numero.strip(),),
        ).fetchone()

        if not conta:
            raise HTTPException(status_code=404, detail="Conta corrente não localizada.")

        return dict(conta)

    @app.get("/lotes")
    def listar_lotes(
        instituicaoResp: str = "",
        instituicao: str = "",
        situacao: str = "Todas",
        idLoteDe: int | None = Query(default=None),
        idLoteAte: int | None = Query(default=None),
        valorDe: float | None = Query(default=None),
        valorAte: float | None = Query(default=None),
        dataEntradaDe: str = "",
        dataEntradaAte: str = "",
        db: sqlite3.Connection = Depends(get_db),
    ) -> list[dict[str, Any]]:
        filters = []
        params: list[Any] = []

        if instituicaoResp.strip():
            filters.append("LOWER(instituicao_resp) LIKE ?")
            params.append(f"%{instituicaoResp.strip().lower()}%")
        if instituicao.strip():
            filters.append("LOWER(instituicao) LIKE ?")
            params.append(f"%{instituicao.strip().lower()}%")
        if situacao != "Todas":
            filters.append("situacao_lote = ?")
            params.append(situacao)
        if idLoteDe is not None:
            filters.append("id_lote >= ?")
            params.append(idLoteDe)
        if idLoteAte is not None:
            filters.append("id_lote <= ?")
            params.append(idLoteAte)
        if valorDe is not None:
            filters.append("valor >= ?")
            params.append(valorDe)
        if valorAte is not None:
            filters.append("valor <= ?")
            params.append(valorAte)
        if dataEntradaDe:
            filters.append("data_entrada >= ?")
            params.append(dataEntradaDe)
        if dataEntradaAte:
            filters.append("data_entrada <= ?")
            params.append(dataEntradaAte)

        where = f"WHERE {' AND '.join(filters)}" if filters else ""
        rows = db.execute(f"SELECT * FROM lotes {where} ORDER BY id_lote", params).fetchall()
        return [to_lote_response(db, row) for row in rows]

    @app.post("/lotes/{id_lote}/lancamentos")
    def incluir_lancamento(
        id_lote: int,
        payload: LancamentoRequest,
        db: sqlite3.Connection = Depends(get_db),
    ) -> dict[str, Any]:
        lote = db.execute("SELECT * FROM lotes WHERE id_lote = ?", (id_lote,)).fetchone()

        if not lote:
            raise HTTPException(status_code=404, detail="Lote não localizado.")

        db.execute(
            """
            INSERT INTO lancamentos (
              id_lote, pa, conta_corrente, titular, valor, historico, estorno,
              documento, descricao, situacao, situacao_documento_csc, retorno_proc
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                id_lote,
                payload.pa,
                payload.contaCorrente,
                payload.titular,
                payload.valor,
                payload.historico,
                int(payload.estorno),
                payload.documento,
                payload.descricao,
                payload.situacao,
                payload.situacaoDocumentoCsc,
                payload.retornoProc,
            ),
        )
        db.execute(
            """
            UPDATE lotes
            SET valor = (SELECT COALESCE(SUM(valor), 0) FROM lancamentos WHERE id_lote = ?),
                quantidade_lancamentos = (SELECT COUNT(*) FROM lancamentos WHERE id_lote = ?)
            WHERE id_lote = ?
            """,
            (id_lote, id_lote, id_lote),
        )
        db.commit()

        updated = db.execute("SELECT * FROM lotes WHERE id_lote = ?", (id_lote,)).fetchone()
        return to_lote_response(db, updated)

    return app


def to_lote_response(db: sqlite3.Connection, row: sqlite3.Row) -> dict[str, Any]:
    lancamentos = db.execute(
        "SELECT * FROM lancamentos WHERE id_lote = ? ORDER BY id_lancamento",
        (row["id_lote"],),
    ).fetchall()

    return {
        "idLote": row["id_lote"],
        "dataEntrada": row["data_entrada"],
        "valor": row["valor"],
        "quantidadeLancamentos": row["quantidade_lancamentos"],
        "usuarioRegistro": row["usuario_registro"],
        "usuarioAprovacao": row["usuario_aprovacao"],
        "situacaoLote": row["situacao_lote"],
        "dataHoraSituacaoLote": row["data_hora_situacao_lote"],
        "instituicaoResp": row["instituicao_resp"],
        "instituicao": row["instituicao"],
        "lancamentos": [to_lancamento_response(item) for item in lancamentos],
    }


def to_lancamento_response(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "idLancamento": row["id_lancamento"],
        "pa": row["pa"],
        "contaCorrente": row["conta_corrente"],
        "titular": row["titular"],
        "valor": row["valor"],
        "historico": row["historico"],
        "estorno": bool(row["estorno"]),
        "documento": row["documento"],
        "descricao": row["descricao"],
        "situacao": row["situacao"],
        "situacaoDocumentoCsc": row["situacao_documento_csc"],
        "retornoProc": row["retorno_proc"],
    }


app = create_app()
