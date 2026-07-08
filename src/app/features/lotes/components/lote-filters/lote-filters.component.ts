import { Component, EventEmitter, OnDestroy, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { FiltroLote } from '../../models/filtro-lote.model';
import { SituacaoLote } from '../../models/lote.model';

@Component({
  selector: 'app-lote-filters',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './lote-filters.component.html',
  styleUrl: './lote-filters.component.scss'
})
export class LoteFiltersComponent implements OnDestroy {
  @Output() pesquisar = new EventEmitter<FiltroLote>();

  readonly situacoes: Array<SituacaoLote | 'Todas'> = ['Todas', 'Aberto', 'Enviado', 'Confirmado'];
  protected expanded = true;

  private readonly fb = inject(FormBuilder);
  private readonly searchRequests = new Subject<FiltroLote>();
  private readonly searchSubscription: Subscription = this.searchRequests
    .pipe(debounceTime(300))
    .subscribe((filtro) => this.pesquisar.emit(filtro));

  readonly form = this.fb.group({
    instituicaoResp: ['0001 - SICOOB'],
    instituicao: ['0002 - SICOOB CENTRAL'],
    situacao: ['Todas' as SituacaoLote | 'Todas'],
    idLoteDe: [null as number | null],
    idLoteAte: [null as number | null],
    valorDe: [null as number | null],
    valorAte: [null as number | null],
    dataEntradaDe: [''],
    dataEntradaAte: ['']
  });

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  ngOnDestroy(): void {
    this.searchSubscription.unsubscribe();
  }

  submit(): void {
    this.searchRequests.next(this.getFiltro());
  }

  private getFiltro(): FiltroLote {
    const raw = this.form.getRawValue();

    return {
      instituicaoResp: raw.instituicaoResp ?? '',
      instituicao: raw.instituicao ?? '',
      situacao: raw.situacao ?? 'Todas',
      idLoteDe: raw.idLoteDe,
      idLoteAte: raw.idLoteAte,
      valorDe: raw.valorDe,
      valorAte: raw.valorAte,
      dataEntradaDe: raw.dataEntradaDe ?? '',
      dataEntradaAte: raw.dataEntradaAte ?? ''
    };
  }
}
