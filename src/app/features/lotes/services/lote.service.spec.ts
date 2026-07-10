import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { APP_SETTINGS } from '../../../shared/app-settings';
import { LoteService } from './lote.service';
import { Lancamento } from '../models/lancamento.model';

describe('LoteService', () => {
  let service: LoteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_SETTINGS, useValue: { apiBaseUrl: 'http://127.0.0.1:8000', useMock: false } }
      ]
    });
    service = TestBed.inject(LoteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests lots from the FastAPI backend with informed filters', () => {
    service
      .pesquisarLotes({
        instituicaoResp: '',
        instituicao: '',
        situacao: 'Aberto',
        idLoteDe: 2,
        idLoteAte: 2,
        valorDe: 1000,
        valorAte: 1000,
        dataEntradaDe: '2026-04-26',
        dataEntradaAte: '2026-04-26'
      })
      .subscribe((lotes) => {
        expect(lotes[0].idLote).toBe(2);
      });

    const request = httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/lotes'));
    expect(request.request.params.get('situacao')).toBe('Aberto');
    expect(request.request.params.get('idLoteDe')).toBe('2');
    request.flush([{ idLote: 2 }]);
  });

  it('posts a launch to the selected lot endpoint', () => {
    const lancamento: Lancamento = {
      idLancamento: 0,
      pa: '01',
      contaCorrente: '444444',
      titular: 'Iris Maria Costa',
      valor: 25,
      historico: 'Lançamento Manual',
      estorno: false,
      documento: 'DOC-001',
      descricao: 'Ajuste manual',
      situacao: 'Pendente',
      situacaoDocumentoCsc: 'Pendente',
      retornoProc: ''
    };

    service.incluirLancamento(2, lancamento).subscribe((lote) => {
      expect(lote.idLote).toBe(2);
      expect(lote.quantidadeLancamentos).toBe(2);
    });

    const request = httpMock.expectOne((req) => req.method === 'POST' && req.url.endsWith('/lotes/2/lancamentos'));
    expect(request.request.body.valor).toBe(25);
    request.flush({ idLote: 2, quantidadeLancamentos: 2 });
  });

  it('filters lots from the local mock when useMock is enabled', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_SETTINGS, useValue: { apiBaseUrl: 'http://127.0.0.1:8000', useMock: true } }
      ]
    });
    service = TestBed.inject(LoteService);
    httpMock = TestBed.inject(HttpTestingController);

    service
      .pesquisarLotes({
        instituicaoResp: '',
        instituicao: '',
        situacao: 'Aberto',
        idLoteDe: null,
        idLoteAte: null,
        valorDe: null,
        valorAte: null,
        dataEntradaDe: '',
        dataEntradaAte: ''
      })
      .subscribe((lotes) => {
        expect(lotes.length).toBe(1);
        expect(lotes[0].idLote).toBe(2);
      });

    tick(200);
    httpMock.expectNone((req) => req.url.endsWith('/lotes'));
  }));

  it('includes launches in the selected local mock lot when useMock is enabled', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_SETTINGS, useValue: { apiBaseUrl: 'http://127.0.0.1:8000', useMock: true } }
      ]
    });
    service = TestBed.inject(LoteService);
    httpMock = TestBed.inject(HttpTestingController);

    const lancamento: Lancamento = {
      idLancamento: 0,
      pa: '01',
      contaCorrente: '444444',
      titular: 'Iris Maria Costa',
      valor: 25,
      historico: 'LanÃ§amento Manual',
      estorno: false,
      documento: 'DOC-002',
      descricao: 'Ajuste manual',
      situacao: 'Pendente',
      situacaoDocumentoCsc: 'Pendente',
      retornoProc: ''
    };

    service.incluirLancamento(2, lancamento).subscribe((lote) => {
      expect(lote.idLote).toBe(2);
      expect(lote.valor).toBe(1025);
      expect(lote.quantidadeLancamentos).toBe(2);
      expect(lote.lancamentos.at(-1)?.idLancamento).toBe(2);
    });

    tick(200);
    httpMock.expectNone((req) => req.url.endsWith('/lotes/2/lancamentos'));
  }));
});
