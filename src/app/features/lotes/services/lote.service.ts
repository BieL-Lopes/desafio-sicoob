import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../shared/api.config';
import { FiltroLote } from '../models/filtro-lote.model';
import { ContaCorrente, Lancamento } from '../models/lancamento.model';
import { Lote } from '../models/lote.model';

@Injectable({ providedIn: 'root' })
export class LoteService {
  private readonly http = inject(HttpClient);

  pesquisarLotes(filtro: FiltroLote): Observable<Lote[]> {
    return this.http.get<Lote[]>(`${API_BASE_URL}/lotes`, { params: this.toParams(filtro) });
  }

  buscarContaCorrente(numero: string): Observable<ContaCorrente> {
    return this.http
      .get<ContaCorrente>(`${API_BASE_URL}/contas-correntes/${encodeURIComponent(numero.trim())}`)
      .pipe(catchError((error) => this.toMessageError(error, 'Conta corrente não localizada.')));
  }

  incluirLancamento(idLote: number, lancamento: Lancamento): Observable<Lote> {
    return this.http
      .post<Lote>(`${API_BASE_URL}/lotes/${idLote}/lancamentos`, lancamento)
      .pipe(catchError((error) => this.toMessageError(error, 'Não foi possível incluir o lançamento.')));
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
}
