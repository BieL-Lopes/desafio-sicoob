import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

registerLocaleData(localePt);

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent]
    }).compileComponents();
  });

  it('creates the consultation screen shell', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Outros Créditos/Débitos');
    expect(compiled.textContent).toContain('Pesquisar');
    expect(compiled.textContent).toContain('INCLUIR');
  });

  it('keeps single-record actions disabled until exactly one lot is selected', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.hasSingleSelection()).toBeFalse();

    component.toggleSelection(2, true);
    expect(component.hasSingleSelection()).toBeTrue();

    component.toggleSelection(3, true);
    expect(component.hasSingleSelection()).toBeFalse();
  });

  it('opens the launch modal from the Incluir action', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    fixture.componentInstance.openIncluirModal();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('INCLUIR LANÇAMENTO');
  });

  it('keeps the modal open and refreshes the lot when a launch is included', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.loading = false;
    component.lotes = [
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
        lancamentos: []
      }
    ];
    component.modalOpen = true;

    component.updateLote({
      ...component.lotes[0],
      valor: 1025,
      quantidadeLancamentos: 2,
      lancamentos: [
        {
          idLancamento: 2,
          pa: '01',
          contaCorrente: '444444',
          titular: 'Iris Maria Costa',
          valor: 25,
          historico: 'Lançamento Manual',
          estorno: false,
          documento: '8075',
          descricao: 'Ajuste manual',
          situacao: 'Pendente',
          situacaoDocumentoCsc: 'Pendente',
          retornoProc: ''
        }
      ]
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(component.modalOpen).toBeTrue();
    expect(component.selectedIds.has(2)).toBeTrue();
    expect(component.pagedLotes[0].valor).toBe(1025);
    expect(compiled.textContent).toContain('1.025,00');
    expect(compiled.textContent).toContain('Lançamento Manual');
    expect(compiled.textContent).toContain('25,00');
    expect(compiled.textContent).toContain('INCLUIR LANÇAMENTO');
  });
});
