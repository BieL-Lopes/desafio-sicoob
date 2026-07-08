from fastapi.testclient import TestClient

from app.main import create_app


def test_health_returns_ok(tmp_path):
    client = TestClient(create_app(tmp_path / "test.db"))

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_login_accepts_seed_user(tmp_path):
    client = TestClient(create_app(tmp_path / "test.db"))

    response = client.post("/auth/login", json={"usuario": "admin", "senha": "admin"})

    assert response.status_code == 200
    body = response.json()
    assert body["token"]
    assert body["usuario"] == "admin"


def test_login_rejects_invalid_password(tmp_path):
    client = TestClient(create_app(tmp_path / "test.db"))

    response = client.post("/auth/login", json={"usuario": "admin", "senha": "errada"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Usuário ou senha inválidos."


def test_get_lotes_filters_by_status_and_range(tmp_path):
    client = TestClient(create_app(tmp_path / "test.db"))

    response = client.get(
        "/lotes",
        params={
            "situacao": "Aberto",
            "idLoteDe": 2,
            "idLoteAte": 2,
            "valorDe": 1000,
            "valorAte": 1000,
            "dataEntradaDe": "2026-04-26",
            "dataEntradaAte": "2026-04-26",
        },
    )

    assert response.status_code == 200
    lotes = response.json()
    assert len(lotes) == 1
    assert lotes[0]["idLote"] == 2
    assert lotes[0]["situacaoLote"] == "Aberto"


def test_get_conta_corrente_returns_holder(tmp_path):
    client = TestClient(create_app(tmp_path / "test.db"))

    response = client.get("/contas-correntes/444444")

    assert response.status_code == 200
    assert response.json() == {"numero": "444444", "titular": "Iris Maria Costa"}


def test_post_lancamento_adds_launch_and_updates_lot(tmp_path):
    client = TestClient(create_app(tmp_path / "test.db"))

    response = client.post(
        "/lotes/2/lancamentos",
        json={
            "pa": "01",
            "contaCorrente": "444444",
            "titular": "Iris Maria Costa",
            "valor": 25,
            "historico": "Lançamento Manual",
            "estorno": False,
            "documento": "8076",
            "descricao": "Ajuste manual",
            "situacao": "Pendente",
            "situacaoDocumentoCsc": "Pendente",
            "retornoProc": "",
        },
    )

    assert response.status_code == 200
    lote = response.json()
    assert lote["idLote"] == 2
    assert lote["valor"] == 1025
    assert lote["quantidadeLancamentos"] == 2
    assert lote["lancamentos"][-1]["idLancamento"] > 0
    assert lote["lancamentos"][-1]["valor"] == 25
