import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Lote } from '../../models/lote.model';
import { LancamentoModalComponent } from './lancamento-modal.component';

registerLocaleData(localePt);

describe('LancamentoModalComponent', () => {
  let fixture: ComponentFixture<LancamentoModalComponent>;

  const lote: Lote = {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LancamentoModalComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(LancamentoModalComponent);
    fixture.componentRef.setInput('lote', lote);
    fixture.detectChanges();
  });

  it('renders the inclusion form with the launches grid and documented actions', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.modal table')).not.toBeNull();
    expect(compiled.textContent).toContain('Id Lançamento');
    expect(compiled.textContent).toContain('DUPLICAR');
    expect(compiled.textContent).toContain('VISUALIZAR');
    expect(compiled.textContent).toContain('ALTERAR');
    expect(compiled.textContent).toContain('EXCLUIR');
    expect(compiled.textContent).not.toContain('CANCELAR');
    expect(compiled.textContent).toContain('INCLUIR');
  });
});
