import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoteFiltersComponent } from './lote-filters.component';

describe('LoteFiltersComponent', () => {
  let fixture: ComponentFixture<LoteFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoteFiltersComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoteFiltersComponent);
    fixture.detectChanges();
  });

  it('marks the filter card as collapsed when the collapse button is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.filters')?.classList).toContain('filters--expanded');
    expect(compiled.querySelector<HTMLButtonElement>('.collapse')?.getAttribute('aria-label')).toBe('Recolher filtros');
    expect(compiled.querySelector('.collapse__icon')).not.toBeNull();
    expect(compiled.querySelector('form')?.querySelector('.search')).not.toBeNull();

    compiled.querySelector<HTMLButtonElement>('.collapse')?.click();
    fixture.detectChanges();

    expect(compiled.querySelector('.filters')?.classList).not.toContain('filters--expanded');
    expect(compiled.querySelector('form')).not.toBeNull();
    expect(compiled.querySelector('form')?.classList).toContain('filters__form--collapsed');
    expect(compiled.querySelector('form')?.getAttribute('aria-hidden')).toBe('true');
    expect(compiled.querySelector<HTMLButtonElement>('.collapse')?.getAttribute('aria-label')).toBe('Expandir filtros');
  });

  it('debounces search submissions before emitting filters', fakeAsync(() => {
    const emitted: unknown[] = [];

    fixture.componentInstance.pesquisar.subscribe((filtro) => emitted.push(filtro));
    fixture.componentInstance.submit();

    expect(emitted).toHaveSize(0);

    tick(299);
    expect(emitted).toHaveSize(0);

    tick(1);
    expect(emitted).toHaveSize(1);
    expect(emitted[0]).toEqual(jasmine.objectContaining({ situacao: 'Todas' }));
  }));
});
