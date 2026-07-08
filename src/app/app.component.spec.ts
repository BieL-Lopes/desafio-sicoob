import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
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
});
