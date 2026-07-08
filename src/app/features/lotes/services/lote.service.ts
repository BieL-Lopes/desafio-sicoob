import { Injectable } from '@angular/core';
import { Observable, delay, map, of, throwError } from 'rxjs';
import { FiltroLote } from '../models/filtro-lote.model';
import { ContaCorrente, Lancamento } from '../models/lancamento.model';
import { Lote } from '../models/lote.model';

const MOCK_CONTAS: ContaCorrente[] = [
  { numero: '444444', titular: 'Iris Maria Costa' },
  { numero: '555555', titular: 'Sicoob Cooperado Exemplo' },
  { numero: '123456', titular: 'João Paulo Ferreira' }
];

const MOCK_LOTES: Lote[] = [
  {
    idLote: 2,
    dataEntrada: '2026-04-26',
    valor: 1000,
    quantidadeLancamentos: 1,
    usuarioRegistro: 'gearco0300_00',
    usuarioAprovacao: '',
    situacaoLote: 'Aberto',
    dataHoraSituacaoLote: '2026-04-27T12:35:11',
    instituicaoResp: '0001 - SICOOB',
    instituicao: '0002 - SICOOB CENTRAL',
    lancamentos: [
      {
        idLancamento: 1,
        pa: '01',
        contaCorrente: '444444',
        titular: 'Iris Maria Costa',
        valor: 1000,
        historico: 'Lançamento Manual',
        estorno: false,
        documento: '8075',
        descricao: 'Crédito manual inicial',
        situacao: 'Pendente',
        situacaoDocumentoCsc: 'Pendente',
        retornoProc: ''
      }
    ]
  },
  {
    idLote: 3,
    dataEntrada: '2026-04-28',
    valor: 2480.35,
    quantidadeLancamentos: 2,
    usuarioRegistro: 'contab0180',
    usuarioAprovacao: 'aprovador01',
    situacaoLote: 'Enviado',
    dataHoraSituacaoLote: '2026-04-28T16:12:02',
    instituicaoResp: '0001 - SICOOB',
    instituicao: '0002 - SICOOB CENTRAL',
    lancamentos: []
  },
  {
    idLote: 4,
    dataEntrada: '2026-05-02',
    valor: 740.5,
    quantidadeLancamentos: 1,
    usuarioRegistro: 'contab0220',
    usuarioAprovacao: 'gerente02',
    situacaoLote: 'Confirmado',
    dataHoraSituacaoLote: '2026-05-03T09:45:40',
    instituicaoResp: '0001 - SICOOB',
    instituicao: '0004 - SICOOB NORTE',
    lancamentos: []
  }
];

@Injectable({ providedIn: 'root' })
export class LoteService {
  private lotes: Lote[] = structuredClone(MOCK_LOTES);

  pesquisarLotes(filtro: FiltroLote): Observable<Lote[]> {
    return of(this.lotes).pipe(
      delay(300),
      map((lotes) => lotes.filter((lote) => this.matchesFiltro(lote, filtro)).map((lote) => structuredClone(lote)))
    );
  }

  buscarContaCorrente(numero: string): Observable<ContaCorrente> {
    const conta = MOCK_CONTAS.find((item) => item.numero === numero.trim());

    if (!conta) {
      return throwError(() => new Error('Conta corrente não localizada.')).pipe(delay(250));
    }

    return of(structuredClone(conta)).pipe(delay(250));
  }

  incluirLancamento(idLote: number, lancamento: Lancamento): Observable<Lote> {
    const lote = this.lotes.find((item) => item.idLote === idLote);

    if (!lote) {
      return throwError(() => new Error('Lote não localizado.')).pipe(delay(200));
    }

    const nextId =
      Math.max(0, ...this.lotes.flatMap((item) => item.lancamentos.map((launch) => launch.idLancamento))) + 1;
    const novoLancamento: Lancamento = { ...lancamento, idLancamento: nextId };

    lote.lancamentos = [...lote.lancamentos, novoLancamento];
    lote.quantidadeLancamentos = lote.lancamentos.length;
    lote.valor = lote.lancamentos.reduce((total, item) => total + item.valor, 0);

    return of(structuredClone(lote)).pipe(delay(200));
  }

  private matchesFiltro(lote: Lote, filtro: FiltroLote): boolean {
    return (
      this.matchesText(lote.instituicaoResp, filtro.instituicaoResp) &&
      this.matchesText(lote.instituicao, filtro.instituicao) &&
      (filtro.situacao === 'Todas' || lote.situacaoLote === filtro.situacao) &&
      this.inRange(lote.idLote, filtro.idLoteDe, filtro.idLoteAte) &&
      this.inRange(lote.valor, filtro.valorDe, filtro.valorAte) &&
      this.inDateRange(lote.dataEntrada, filtro.dataEntradaDe, filtro.dataEntradaAte)
    );
  }

  private matchesText(source: string, query: string): boolean {
    if (!query.trim()) {
      return true;
    }

    return source.toLowerCase().includes(query.trim().toLowerCase());
  }

  private inRange(value: number, start: number | null, end: number | null): boolean {
    return (start === null || value >= start) && (end === null || value <= end);
  }

  private inDateRange(value: string, start: string, end: string): boolean {
    return (!start || value >= start) && (!end || value <= end);
  }
}
