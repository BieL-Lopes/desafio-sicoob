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

  it('uses white text on the green include button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const includeButton = compiled.querySelector<HTMLButtonElement>('button.primary');

    expect(getComputedStyle(includeButton!).color).toBe('rgb(255, 255, 255)');
  });

  it('vertically aligns the account holder name with the search icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titular = compiled.querySelector<HTMLElement>('.holder');
    const style = getComputedStyle(titular!);

    expect(style.display).toBe('flex');
    expect(style.alignItems).toBe('center');
    expect(style.minHeight).toBe('30px');
  });

  it('starts the inclusion form without prefilled user input', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const conta = compiled.querySelector<HTMLInputElement>('input[formcontrolname="contaCorrente"]');
    const valor = compiled.querySelector<HTMLInputElement>('input[formcontrolname="valor"]');
    const documento = compiled.querySelector<HTMLInputElement>('input[formcontrolname="documento"]');
    const titular = compiled.querySelector<HTMLElement>('.holder');

    expect(conta?.value).toBe('');
    expect(valor?.value).toBe('');
    expect(documento?.value).toBe('');
    expect(titular?.textContent?.trim()).toBe('');
  });

  it('formats the value field as Brazilian money while typing', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const valor = compiled.querySelector<HTMLInputElement>('input[formcontrolname="valor"]')!;

    valor.value = '150002';
    valor.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(valor.value).toBe('1.500,02');
    expect(fixture.componentInstance.form.controls.valor.value).toBe('1.500,02');
  });

  it('shows required field messages when include is clicked with invalid form', () => {
    fixture.componentInstance.incluir();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Conta corrente é obrigatória.');
    expect(compiled.textContent).toContain('Informe um valor monetário maior que zero.');
    expect(compiled.textContent).toContain('Documento é obrigatório.');
    expect(compiled.textContent).toContain('PA é obrigatório.');
  });
});
