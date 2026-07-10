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
        historico: 'Lancamento Manual',
        estorno: false,
        documento: '8075',
        descricao: 'Credito manual inicial',
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

  it('keeps the launches table inside a dedicated responsive scroll area', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.lancamentos__table > table')).not.toBeNull();
  });

  it('keeps attachment actions inside the attachment section', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const lancamentoActions = compiled.querySelector<HTMLElement>('.lancamentos__actions')!;
    const anexoActions = compiled.querySelector<HTMLElement>('.anexos__actions');

    expect(anexoActions).not.toBeNull();
    expect(lancamentoActions.textContent).not.toContain('VISUALIZAR');
    expect(lancamentoActions.textContent).not.toContain('EXCLUIR');
    expect(lancamentoActions.textContent).toContain('DUPLICAR');
    expect(lancamentoActions.textContent).toContain('INCLUIR');
    expect(lancamentoActions.textContent).toContain('ALTERAR');
    expect(lancamentoActions.textContent).toContain('FECHAR');
    expect(anexoActions?.textContent).toContain('VISUALIZAR');
    expect(anexoActions?.textContent).toContain('INCLUIR');
    expect(anexoActions?.textContent).toContain('EXCLUIR');
  });

  it('renders attachment table headers with readable Portuguese text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headerText = compiled.querySelector<HTMLElement>('.anexos__table thead')?.textContent ?? '';

    expect(headerText).toContain('Nome Reduzido do Arquivo');
    expect(headerText).toContain('Descrição');
    expect(headerText).toContain('Data Inclusão');
    expect(headerText).toContain('ID Usuário');
  });

  it('adds a selected file to the attachments grid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector<HTMLInputElement>('input[data-role="anexo-input"]')!;
    const file = new File(['conteudo'], 'test-incluir.pdf', { type: 'application/pdf' });

    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('test-incluir.pdf');
    expect(compiled.textContent).toContain('admin');
    expect(compiled.textContent).not.toContain('Nenhum registro encontrado.');
  });

  it('deletes the selected attachment from the grid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector<HTMLInputElement>('input[data-role="anexo-input"]')!;
    const file = new File(['conteudo'], 'remover.pdf', { type: 'application/pdf' });

    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    compiled.querySelector<HTMLButtonElement>('button[data-action="excluir-anexo"]')?.click();
    fixture.detectChanges();

    expect(compiled.textContent).not.toContain('remover.pdf');
    expect(compiled.textContent).toContain('Nenhum registro encontrado.');
  });

  it('opens the selected attachment for viewing', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector<HTMLInputElement>('input[data-role="anexo-input"]')!;
    const file = new File(['conteudo'], 'visualizar.pdf', { type: 'application/pdf' });
    const createObjectUrlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:visualizar');
    const openSpy = spyOn(window, 'open');

    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    compiled.querySelector<HTMLButtonElement>('button[data-action="visualizar-anexo"]')?.click();

    expect(createObjectUrlSpy).toHaveBeenCalledWith(file);
    expect(openSpy).toHaveBeenCalledWith('blob:visualizar', '_blank', 'noopener');
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
    expect(compiled.textContent).toContain('Compl. Histórico é obrigatório.');
  });

  it('renders the expanded Documento CSC fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('select[formcontrolname="pa"]')).not.toBeNull();
    expect(compiled.querySelector('input[formcontrolname="idEvento"]')).not.toBeNull();
    expect(compiled.querySelector('textarea[formcontrolname="complementoHistorico"]')).not.toBeNull();
    expect(compiled.querySelector('input[formcontrolname="situacaoDocumentoCsc"]')).not.toBeNull();
    expect(compiled.querySelector('input[formcontrolname="idDocCsc"]')).not.toBeNull();
  });

  it('opens the event search modal, filters any column and confirms the selected event', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buscarEvento = compiled.querySelector<HTMLButtonElement>('button[aria-label="Buscar evento CSC"]')!;

    buscarEvento.click();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Pesquisa Evento');

    const valor = compiled.querySelector<HTMLInputElement>('input[formcontrolname="valorPesquisa"]')!;
    valor.value = 'credito';
    valor.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Centralizacao Titulo CSC Credito');

    compiled.querySelector<HTMLTableRowElement>('.search-results tbody tr')?.click();
    compiled.querySelector<HTMLButtonElement>('[data-action="confirmar-pesquisa"]')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector<HTMLInputElement>('input[formcontrolname="idEvento"]')?.value).toBe('102');
    expect(compiled.textContent).toContain('Centralizacao Titulo CSC Credito');
  });

  it('does not open a search modal for account search', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const buscarConta = compiled.querySelector<HTMLButtonElement>('button[aria-label="Buscar conta corrente"]')!;

    buscarConta.click();
    fixture.detectChanges();

    expect(compiled.textContent).not.toContain('Pesquisa Conta Corrente');
    expect(compiled.querySelector('.search-modal')).toBeNull();
  });
});
