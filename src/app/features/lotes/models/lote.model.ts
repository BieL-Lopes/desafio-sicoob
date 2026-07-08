import { Lancamento } from './lancamento.model';

export type SituacaoLote = 'Aberto' | 'Enviado' | 'Confirmado';

export interface Lote {
  idLote: number;
  dataEntrada: string;
  valor: number;
  quantidadeLancamentos: number;
  usuarioRegistro: string;
  usuarioAprovacao: string;
  situacaoLote: SituacaoLote;
  dataHoraSituacaoLote: string;
  instituicaoResp: string;
  instituicao: string;
  lancamentos: Lancamento[];
}
