import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { positiveMoneyValidator } from '../../../../shared/validators/positive-money.validator';
import { Lancamento } from '../../models/lancamento.model';
import { Lote } from '../../models/lote.model';
import { LoteService } from '../../services/lote.service';

interface PesquisaColuna {
  key: string;
  label: string;
}

interface PesquisaLinha {
  values: Record<string, string>;
}

interface Anexo {
  id: number;
  nomeReduzidoArquivo: string;
  descricao: string;
  dataInclusao: string;
  idUsuario: string;
  file: File;
}

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
  protected eventoDescricao = '';
  protected eventoErro = '';
  protected salvando = false;
  protected pesquisaAberta = false;
  protected selectedPesquisaLinha: PesquisaLinha | null = null;
  protected anexos: Anexo[] = [];
  protected selectedAnexo: Anexo | null = null;

  private readonly fb = inject(FormBuilder);
  private readonly loteService = inject(LoteService);
  private nextAnexoId = 1;
  private readonly eventosPesquisa: PesquisaLinha[] = [
    {
      values: {
        idEvento: '102',
        codEvento: '300',
        descricao: 'Centralizacao Titulo CSC Credito',
        dtInicio: '31/12/2019',
        dtFim: ''
      }
    }
  ];

  readonly form = this.fb.group({
    contaCorrente: ['', [Validators.required]],
    valor: ['', [Validators.required, positiveMoneyValidator()]],
    historico: ['Lançamento Manual', [Validators.required]],
    estorno: [false],
    documento: ['', [Validators.required]],
    descricao: [''],
    situacao: [{ value: 'Pendente', disabled: true }],
    pa: ['', [Validators.required]],
    idEvento: [''],
    complementoHistorico: ['', [Validators.required]],
    situacaoDocumentoCsc: [{ value: 'Aguardando Processamento CCO', disabled: true }],
    idDocCsc: ['']
  });

  readonly pesquisaForm = this.fb.nonNullable.group({
    campoPesquisa: ['ID Evento'],
    valorPesquisa: ['']
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

  buscarEventoCsc(): void {
    this.openPesquisaEvento();
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
      valor: this.formatMoneyAmount(lancamento.valor),
      historico: lancamento.historico,
      estorno: lancamento.estorno,
      documento: lancamento.documento,
      descricao: lancamento.descricao,
      pa: lancamento.pa,
      idEvento: lancamento.idEvento ?? '',
      complementoHistorico: lancamento.complementoHistorico ?? '',
      idDocCsc: lancamento.idDocCsc ?? ''
    });
    this.titular = lancamento.titular;
    this.eventoDescricao = lancamento.eventoCsc ?? '';
  }

  protected abrirSeletorAnexo(input: HTMLInputElement): void {
    input.click();
  }

  protected incluirAnexo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const anexo: Anexo = {
      id: this.nextAnexoId++,
      nomeReduzidoArquivo: file.name,
      descricao: file.name,
      dataInclusao: this.formatDateTime(new Date()),
      idUsuario: 'admin',
      file
    };

    this.anexos = [...this.anexos, anexo];
    this.selectedAnexo = anexo;
    input.value = '';
  }

  protected selecionarAnexo(anexo: Anexo): void {
    this.selectedAnexo = anexo;
  }

  protected visualizarAnexo(): void {
    if (!this.selectedAnexo) {
      return;
    }

    const url = URL.createObjectURL(this.selectedAnexo.file);
    window.open(url, '_blank', 'noopener');
  }

  protected excluirAnexo(): void {
    if (!this.selectedAnexo) {
      return;
    }

    this.anexos = this.anexos.filter((anexo) => anexo.id !== this.selectedAnexo?.id);
    this.selectedAnexo = null;
  }

  protected openPesquisaEvento(): void {
    this.pesquisaAberta = true;
    this.selectedPesquisaLinha = null;
    this.pesquisaForm.reset({
      campoPesquisa: 'ID Evento',
      valorPesquisa: ''
    });
  }

  protected closePesquisa(): void {
    this.pesquisaAberta = false;
    this.selectedPesquisaLinha = null;
  }

  protected selectPesquisaLinha(linha: PesquisaLinha): void {
    this.selectedPesquisaLinha = linha;
  }

  protected confirmarPesquisa(): void {
    if (!this.selectedPesquisaLinha) {
      return;
    }

    this.form.patchValue({ idEvento: this.selectedPesquisaLinha.values['idEvento'] });
    this.eventoDescricao = this.selectedPesquisaLinha.values['descricao'];
    this.eventoErro = '';
    this.closePesquisa();
  }

  protected pesquisaTitulo(): string {
    return 'Pesquisa Evento';
  }

  protected pesquisaColunas(): PesquisaColuna[] {
    return [
      { key: 'idEvento', label: 'ID Evento' },
      { key: 'codEvento', label: 'Cod. Evento' },
      { key: 'descricao', label: 'Descricao' },
      { key: 'dtInicio', label: 'Dt.Inicio' },
      { key: 'dtFim', label: 'Dt.Fim' }
    ];
  }

  protected pesquisaLinhas(): PesquisaLinha[] {
    const valor = this.pesquisaForm.controls.valorPesquisa.value.trim().toLowerCase();

    if (!valor) {
      return this.eventosPesquisa;
    }

    return this.eventosPesquisa.filter((linha) =>
      Object.values(linha.values).some((item) => item.toLowerCase().includes(valor))
    );
  }

  protected formatarValor(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.formatMoneyInput(input.value);

    input.value = formattedValue;
    this.form.controls.valor.setValue(formattedValue, { emitEvent: false });
  }

  protected hasError(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private formatMoneyInput(value: string): string {
    const digits = value.replace(/\D/g, '');

    if (!digits) {
      return '';
    }

    return this.formatMoneyAmount(Number(digits) / 100);
  }

  private formatMoneyAmount(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  private formatDateTime(value: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
      .format(value)
      .replace(',', '');
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
      idEvento: raw.idEvento ?? '',
      eventoCsc: this.eventoDescricao,
      complementoHistorico: raw.complementoHistorico ?? '',
      situacaoDocumentoCsc: raw.situacaoDocumentoCsc ?? 'Aguardando Processamento CCO',
      idDocCsc: raw.idDocCsc ?? '',
      retornoProc: ''
    };
  }
}
