import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

registerLocaleData(localePt);

describe('AppComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('shows the login screen when there is no authenticated session', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Acesso ao módulo contábil');
    expect(compiled.textContent).toContain('ENTRAR');
  });

  it('creates the consultation screen shell for authenticated users', () => {
    const fixture = createAuthenticatedFixture();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Outros Créditos/Débitos');
    expect(compiled.textContent).toContain('Pesquisar');
    expect(compiled.textContent).toContain('INCLUIR');
    expect(compiled.textContent).toContain('admin');
  });

  it('keeps single-record actions disabled until exactly one lot is selected', () => {
    const fixture = createAuthenticatedFixture();
    const component = fixture.componentInstance;

    expect(component.hasSingleSelection()).toBeFalse();

    component.toggleSelection(2, true);
    expect(component.hasSingleSelection()).toBeTrue();

    component.toggleSelection(3, true);
    expect(component.hasSingleSelection()).toBeFalse();
  });

  it('opens the launch modal from the Incluir action', () => {
    const fixture = createAuthenticatedFixture();

    fixture.componentInstance.openIncluirModal();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('INCLUIR LANÇAMENTO');
  });

  it('keeps the modal open and refreshes the lot when a launch is included', () => {
    const fixture = createAuthenticatedFixture();
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

  function createAuthenticatedFixture(): ComponentFixture<AppComponent> {
    localStorage.setItem('auth_token', 'mock-token-admin');
    localStorage.setItem('auth_user', 'admin');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    httpMock.expectOne((req) => req.method === 'GET' && req.url.endsWith('/lotes')).flush([]);
    fixture.detectChanges();
    return fixture;
  }
});
