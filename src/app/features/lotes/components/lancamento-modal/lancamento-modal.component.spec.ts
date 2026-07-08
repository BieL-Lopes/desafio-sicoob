import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LancamentoModalComponent } from './lancamento-modal.component';
import { Lote } from '../../models/lote.model';

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
      imports: [LancamentoModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LancamentoModalComponent);
    fixture.componentRef.setInput('lote', lote);
    fixture.detectChanges();
  });

  it('renders the inclusion form without an internal launches table', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.modal table')).toBeNull();
    expect(compiled.textContent).not.toContain('Id Lançamento');
    expect(compiled.textContent).not.toContain('DUPLICAR');
    expect(compiled.textContent).not.toContain('VISUALIZAR');
    expect(compiled.textContent).not.toContain('ALTERAR');
    expect(compiled.textContent).not.toContain('EXCLUIR');
    expect(compiled.textContent).toContain('CANCELAR');
    expect(compiled.textContent).toContain('INCLUIR');
  });
});
