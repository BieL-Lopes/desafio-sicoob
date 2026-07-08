export type SituacaoLancamento = 'Pendente' | 'Confirmado' | 'Excluído';

export interface Lancamento {
  idLancamento: number;
  pa: string;
  contaCorrente: string;
  titular: string;
  valor: number;
  historico: string;
  estorno: boolean;
  documento: string;
  descricao: string;
  situacao: SituacaoLancamento;
  situacaoDocumentoCsc: string;
  retornoProc: string;
}

export interface ContaCorrente {
  numero: string;
  titular: string;
}
