import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Lote } from '../../models/lote.model';

@Component({
  selector: 'app-lote-results-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lote-results-table.component.html',
  styleUrl: './lote-results-table.component.scss'
})
export class LoteResultsTableComponent {
  @Input({ required: true }) lotes: Lote[] = [];
  @Input({ required: true }) selectedIds = new Set<number>();
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() loading = false;

  @Output() selectionChange = new EventEmitter<{ idLote: number; selected: boolean }>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  @Output() pageChange = new EventEmitter<number>();

  get allSelected(): boolean {
    return this.lotes.length > 0 && this.lotes.every((lote) => this.selectedIds.has(lote.idLote));
  }

  goToPage(page: number): void {
    const nextPage = Math.max(1, Math.min(this.totalPages, page));
    this.pageChange.emit(nextPage);
  }
}
