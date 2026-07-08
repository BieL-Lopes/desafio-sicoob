import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { positiveMoneyValidator } from '../../../../shared/validators/positive-money.validator';
import { Lancamento } from '../../models/lancamento.model';
import { Lote } from '../../models/lote.model';
import { LoteService } from '../../services/lote.service';

@Component({
  selector: 'app-lancamento-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lancamento-modal.component.html',
  styleUrl: './lancamento-modal.component.scss'
})
export class LancamentoModalComponent {
  @Input({ required: true }) lote: Lote | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() loteAtualizado = new EventEmitter<Lote>();

  protected titular = '';
  protected contaErro = '';
  protected salvando = false;

  private readonly fb = inject(FormBuilder);
  private readonly loteService = inject(LoteService);

  readonly form = this.fb.group({
    contaCorrente: ['444444', [Validators.required]],
    valor: ['25', [Validators.required, positiveMoneyValidator()]],
    historico: ['Lançamento Manual', [Validators.required]],
    estorno: [false],
    documento: ['8075', [Validators.required]],
    descricao: [''],
    situacao: [{ value: 'Pendente', disabled: true }],
    pa: ['01', [Validators.required]]
  });

  buscarConta(): void {
    const numero = this.form.controls.contaCorrente.value ?? '';
    this.contaErro = '';
    this.titular = '';

    this.loteService.buscarContaCorrente(numero).subscribe({
      next: (conta) => {
        this.titular = conta.titular;
      },
      error: (error: Error) => {
        this.contaErro = error.message;
      }
    });
  }

  incluir(): void {
    if (!this.lote) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando = true;
    this.loteService.incluirLancamento(this.lote.idLote, this.toLancamento()).subscribe({
      next: (lote) => {
        this.salvando = false;
        this.loteAtualizado.emit(lote);
      },
      error: () => {
        this.salvando = false;
      }
    });
  }

  duplicar(): void {
    const lancamento = this.lote?.lancamentos.at(-1);

    if (!lancamento) {
      return;
    }

    this.form.patchValue({
      contaCorrente: lancamento.contaCorrente,
      valor: String(lancamento.valor).replace('.', ','),
      historico: lancamento.historico,
      estorno: lancamento.estorno,
      documento: lancamento.documento,
      descricao: lancamento.descricao,
      pa: lancamento.pa
    });
    this.titular = lancamento.titular;
  }

  protected hasError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private toLancamento(): Lancamento {
    const raw = this.form.getRawValue();
    const valor = Number(String(raw.valor).replace(/\./g, '').replace(',', '.'));

    return {
      idLancamento: 0,
      pa: raw.pa ?? '',
      contaCorrente: raw.contaCorrente ?? '',
      titular: this.titular,
      valor,
      historico: raw.historico ?? '',
      estorno: raw.estorno ?? false,
      documento: raw.documento ?? '',
      descricao: raw.descricao ?? '',
      situacao: 'Pendente',
      situacaoDocumentoCsc: 'Pendente',
      retornoProc: ''
    };
  }
}
