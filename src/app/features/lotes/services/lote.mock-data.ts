import { ContaCorrente, Lancamento } from '../models/lancamento.model';
import { Lote } from '../models/lote.model';

export const MOCK_CONTAS_CORRENTES: ContaCorrente[] = [
  { numero: '444444', titular: 'Iris Maria Costa' },
  { numero: '555555', titular: 'Sicoob Cooperado Exemplo' },
  { numero: '123456', titular: 'Joao Paulo Ferreira' }
];

const LANCAMENTO_INICIAL: Lancamento = {
  idLancamento: 1,
  pa: '01',
  contaCorrente: '444444',
  titular: 'Iris Maria Costa',
  valor: 1000,
  historico: 'Lancamento Manual',
  estorno: false,
  documento: '8075',
  descricao: 'Credito manual inicial',
  situacao: 'Pendente',
  situacaoDocumentoCsc: 'Pendente',
  retornoProc: ''
};

export function createMockLotes(): Lote[] {
  return [
    {
      idLote: 2,
      dataEntrada: '2026-04-26',
      valor: 1000,
      quantidadeLancamentos: 1,
      usuarioRegistro: 'gearco0300_00',
      usuarioAprovacao: '',
      situacaoLote: 'Aberto',
      dataHoraSituacaoLote: '2026-04-27T12:35:11',
      instituicaoResp: '0001 - SICOOB',
      instituicao: '0002 - SICOOB CENTRAL',
      lancamentos: [{ ...LANCAMENTO_INICIAL }]
    },
    {
      idLote: 3,
      dataEntrada: '2026-04-28',
      valor: 2480.35,
      quantidadeLancamentos: 2,
      usuarioRegistro: 'contab0180',
      usuarioAprovacao: 'aprovador01',
      situacaoLote: 'Enviado',
      dataHoraSituacaoLote: '2026-04-28T16:12:02',
      instituicaoResp: '0001 - SICOOB',
      instituicao: '0002 - SICOOB CENTRAL',
      lancamentos: []
    },
    {
      idLote: 4,
      dataEntrada: '2026-05-02',
      valor: 740.5,
      quantidadeLancamentos: 1,
      usuarioRegistro: 'contab0220',
      usuarioAprovacao: 'gerente02',
      situacaoLote: 'Confirmado',
      dataHoraSituacaoLote: '2026-05-03T09:45:40',
      instituicaoResp: '0001 - SICOOB',
      instituicao: '0004 - SICOOB NORTE',
      lancamentos: []
    }
  ];
}
