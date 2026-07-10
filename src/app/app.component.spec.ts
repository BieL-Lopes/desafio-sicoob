import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { APP_SETTINGS } from './shared/app-settings';

registerLocaleData(localePt);

describe('AppComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_SETTINGS, useValue: { apiBaseUrl: 'http://127.0.0.1:8000', useMock: false } }
      ]
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
    expect(compiled.querySelector<HTMLButtonElement>('.logout')?.getAttribute('aria-label')).toBe('Sair');
    expect(compiled.querySelector<HTMLButtonElement>('.logout')?.textContent?.trim()).not.toBe('SAIR');
  });

  it('toggles the responsive side menu', () => {
    const fixture = createAuthenticatedFixture();
    const component = fixture.componentInstance;

    expect(component.mobileMenuOpen).toBeFalse();

    component.toggleMobileMenu();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(component.mobileMenuOpen).toBeTrue();
    expect(compiled.querySelector<HTMLButtonElement>('.menu-toggle')?.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelector('.sidebar')?.classList).toContain('sidebar--open');
  });

  it('renders the responsive menu button inside the page header', () => {
    const fixture = createAuthenticatedFixture();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.page__header .menu-toggle')).not.toBeNull();
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

  it('shows a success modal when selected lots are sent', () => {
    const fixture = createAuthenticatedFixture();
    const component = fixture.componentInstance;
    component.toggleSelection(2, true);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[data-action="enviar"]')?.click();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.success-modal__icon')).not.toBeNull();
    expect(compiled.textContent).toContain('Enviado com sucesso');
  });

  it('shows a success modal when selected lots are confirmed', () => {
    const fixture = createAuthenticatedFixture();
    const component = fixture.componentInstance;
    component.toggleSelection(2, true);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[data-action="confirmar"]')?.click();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.success-modal__icon')).not.toBeNull();
    expect(compiled.textContent).toContain('Confirmado com sucesso');
  });

  it('opens a readonly visualization modal for one selected lot', () => {
    const fixture = createAuthenticatedFixture();
    const component = fixture.componentInstance;
    component.lotes = [
      {
        idLote: 2,
        dataEntrada: '2026-04-26',
        valor: 1325,
        quantidadeLancamentos: 2,
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
      }
    ];
    component.toggleSelection(2, true);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[data-action="visualizar"]')?.click();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.view-modal')).not.toBeNull();
    expect(compiled.textContent).toContain('VISUALIZAR LOTE');
    expect(compiled.textContent).toContain('gearco0300_00');
    expect(compiled.textContent).toContain('1.325,00');
    expect(compiled.textContent).toContain('Lançamento Manual');
    expect(getComputedStyle(compiled.querySelector<HTMLTableCellElement>('.view-launches th')!).color).toBe(
      'rgb(255, 255, 255)'
    );
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
