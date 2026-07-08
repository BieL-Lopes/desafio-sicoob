import { SituacaoLote } from './lote.model';

export interface FiltroLote {
  instituicaoResp: string;
  instituicao: string;
  situacao: SituacaoLote | 'Todas';
  idLoteDe: number | null;
  idLoteAte: number | null;
  valorDe: number | null;
  valorAte: number | null;
  dataEntradaDe: string;
  dataEntradaAte: string;
}
