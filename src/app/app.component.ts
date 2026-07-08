import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { LancamentoModalComponent } from './features/lotes/components/lancamento-modal/lancamento-modal.component';
import { LoteFiltersComponent } from './features/lotes/components/lote-filters/lote-filters.component';
import { LoteResultsTableComponent } from './features/lotes/components/lote-results-table/lote-results-table.component';
import { FiltroLote } from './features/lotes/models/filtro-lote.model';
import { Lote } from './features/lotes/models/lote.model';
import { LoteService } from './features/lotes/services/lote.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoteFiltersComponent, LoteResultsTableComponent, LancamentoModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  readonly pageSize = 5;

  lotes: Lote[] = [];
  selectedIds = new Set<number>();
  currentPage = 1;
  loading = false;
  errorMessage = '';
  modalOpen = false;

  private readonly loteService = inject(LoteService);
  private lastFiltro: FiltroLote = {
    instituicaoResp: '',
    instituicao: '',
    situacao: 'Todas',
    idLoteDe: null,
    idLoteAte: null,
    valorDe: null,
    valorAte: null,
    dataEntradaDe: '',
    dataEntradaAte: ''
  };

  ngOnInit(): void {
    this.pesquisar(this.lastFiltro);
  }

  get selectedLote(): Lote | null {
    const [idLote] = Array.from(this.selectedIds);
    return this.lotes.find((lote) => lote.idLote === idLote) ?? this.lotes[0] ?? null;
  }

  get pagedLotes(): Lote[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.lotes.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.lotes.length / this.pageSize));
  }

  pesquisar(filtro: FiltroLote): void {
    this.lastFiltro = filtro;
    this.loading = true;
    this.errorMessage = '';
    this.selectedIds.clear();

    this.loteService.pesquisarLotes(filtro).subscribe({
      next: (lotes) => {
        this.lotes = lotes;
        this.currentPage = 1;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Não foi possível consultar os lotes.';
        this.loading = false;
      }
    });
  }

  toggleSelection(idLote: number, selected: boolean): void {
    if (selected) {
      this.selectedIds.add(idLote);
    } else {
      this.selectedIds.delete(idLote);
    }

    this.selectedIds = new Set(this.selectedIds);
  }

  toggleAll(selected: boolean): void {
    if (selected) {
      this.pagedLotes.forEach((lote) => this.selectedIds.add(lote.idLote));
    } else {
      this.pagedLotes.forEach((lote) => this.selectedIds.delete(lote.idLote));
    }

    this.selectedIds = new Set(this.selectedIds);
  }

  hasSingleSelection(): boolean {
    return this.selectedIds.size === 1;
  }

  hasSelection(): boolean {
    return this.selectedIds.size > 0;
  }

  openIncluirModal(): void {
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  updateLote(loteAtualizado: Lote): void {
    this.lotes = this.lotes.map((lote) => (lote.idLote === loteAtualizado.idLote ? loteAtualizado : lote));
    this.selectedIds = new Set([loteAtualizado.idLote]);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }
}
