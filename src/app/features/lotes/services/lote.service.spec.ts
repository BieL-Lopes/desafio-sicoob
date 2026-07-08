import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoteService } from './lote.service';
import { Lancamento } from '../models/lancamento.model';

describe('LoteService', () => {
  let service: LoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoteService);
  });

  it('filters lots by situation, id range, amount range and entry date range', fakeAsync(() => {
    let resultCount = 0;

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
        resultCount = lotes.length;
        expect(lotes[0].idLote).toBe(2);
      });

    tick(350);

    expect(resultCount).toBe(1);
  }));

  it('adds a launch to a lot in memory', fakeAsync(() => {
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

    let quantidadeLancamentos = 0;

    service.incluirLancamento(2, lancamento).subscribe((lote) => {
      quantidadeLancamentos = lote.lancamentos.length;
      expect(lote.lancamentos.at(-1)?.idLancamento).toBeGreaterThan(0);
      expect(lote.quantidadeLancamentos).toBe(lote.lancamentos.length);
    });

    tick(250);

    expect(quantidadeLancamentos).toBeGreaterThan(0);
  }));
});
