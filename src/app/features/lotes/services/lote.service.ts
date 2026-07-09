import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay, of, throwError } from 'rxjs';
import { APP_SETTINGS } from '../../../shared/app-settings';
import { FiltroLote } from '../models/filtro-lote.model';
import { ContaCorrente, Lancamento } from '../models/lancamento.model';
import { Lote } from '../models/lote.model';
import { MOCK_CONTAS_CORRENTES, createMockLotes } from './lote.mock-data';

const MOCK_DELAY_MS = 200;

@Injectable({ providedIn: 'root' })
export class LoteService {
  private readonly http = inject(HttpClient);
  private readonly settings = inject(APP_SETTINGS);
  private readonly mockLotes = createMockLotes();
  private readonly mockContas = MOCK_CONTAS_CORRENTES;

  pesquisarLotes(filtro: FiltroLote): Observable<Lote[]> {
    if (this.settings.useMock) {
      return of(this.filterMockLotes(filtro).map((lote) => this.cloneLote(lote))).pipe(delay(MOCK_DELAY_MS));
    }

    return this.http.get<Lote[]>(`${this.settings.apiBaseUrl}/lotes`, { params: this.toParams(filtro) });
  }

  buscarContaCorrente(numero: string): Observable<ContaCorrente> {
    if (this.settings.useMock) {
      const conta = this.mockContas.find((item) => item.numero === numero.trim());

      if (!conta) {
        return throwError(() => new Error('Conta corrente nao localizada.')).pipe(delay(MOCK_DELAY_MS));
      }

      return of({ ...conta }).pipe(delay(MOCK_DELAY_MS));
    }

    return this.http
      .get<ContaCorrente>(`${this.settings.apiBaseUrl}/contas-correntes/${encodeURIComponent(numero.trim())}`)
      .pipe(catchError((error) => this.toMessageError(error, 'Conta corrente nao localizada.')));
  }

  incluirLancamento(idLote: number, lancamento: Lancamento): Observable<Lote> {
    if (this.settings.useMock) {
      const lote = this.mockLotes.find((item) => item.idLote === idLote);

      if (!lote) {
        return throwError(() => new Error('Lote nao localizado.')).pipe(delay(MOCK_DELAY_MS));
      }

      const nextLancamento = {
        ...lancamento,
        idLancamento: this.nextLancamentoId(lote)
      };

      lote.lancamentos = [...lote.lancamentos, nextLancamento];
      lote.valor = lote.lancamentos.reduce((total, item) => total + item.valor, 0);
      lote.quantidadeLancamentos = lote.lancamentos.length;

      return of(this.cloneLote(lote)).pipe(delay(MOCK_DELAY_MS));
    }

    return this.http
      .post<Lote>(`${this.settings.apiBaseUrl}/lotes/${idLote}/lancamentos`, lancamento)
      .pipe(catchError((error) => this.toMessageError(error, 'Nao foi possivel incluir o lancamento.')));
  }

  private toParams(filtro: FiltroLote): HttpParams {
    let params = new HttpParams();

    Object.entries(filtro).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }

  private toMessageError(error: HttpErrorResponse, fallback: string): Observable<never> {
    const detail = typeof error.error?.detail === 'string' ? error.error.detail : fallback;
    return throwError(() => new Error(detail));
  }

  private filterMockLotes(filtro: FiltroLote): Lote[] {
    return this.mockLotes.filter((lote) => {
      const instituicaoResp = filtro.instituicaoResp.trim().toLowerCase();
      const instituicao = filtro.instituicao.trim().toLowerCase();

      return (
        (!instituicaoResp || lote.instituicaoResp.toLowerCase().includes(instituicaoResp)) &&
        (!instituicao || lote.instituicao.toLowerCase().includes(instituicao)) &&
        (filtro.situacao === 'Todas' || lote.situacaoLote === filtro.situacao) &&
        (filtro.idLoteDe === null || lote.idLote >= filtro.idLoteDe) &&
        (filtro.idLoteAte === null || lote.idLote <= filtro.idLoteAte) &&
        (filtro.valorDe === null || lote.valor >= filtro.valorDe) &&
        (filtro.valorAte === null || lote.valor <= filtro.valorAte) &&
        (!filtro.dataEntradaDe || lote.dataEntrada >= filtro.dataEntradaDe) &&
        (!filtro.dataEntradaAte || lote.dataEntrada <= filtro.dataEntradaAte)
      );
    });
  }

  private nextLancamentoId(lote: Lote): number {
    const lastId = Math.max(0, ...lote.lancamentos.map((item) => item.idLancamento));
    return lastId + 1;
  }

  private cloneLote(lote: Lote): Lote {
    return {
      ...lote,
      lancamentos: lote.lancamentos.map((lancamento) => ({ ...lancamento }))
    };
  }
}
