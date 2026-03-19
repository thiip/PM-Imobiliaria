import { addMonths, isBefore, isAfter, isSameMonth, differenceInDays } from 'date-fns';

export interface Sale {
  id: number;
  nome: string;
  cpf: string;
  quadra: number;
  lote: number;
  area: number;
  valor: number;
  entrada: number;
  dataEntrada: string | null;
  numParcelas: number;
  dataPrimeiraParcela: string | null;
  valorParcela: number;
  situacao: 'ATIVO' | 'QUITADO' | 'CANCELADO';
  obs: string;
}

export interface Lot {
  quadra: number;
  lote: number;
  area: number;
  rua: string;
  situacao: string;
  proprietario: string;
  cpf: string;
  inscricao: string;
}

export interface Installment {
  saleId: number;
  cliente: string;
  quadra: number;
  lote: number;
  parcela: number;
  totalParcelas: number;
  dataVencimento: Date;
  valor: number;
  status: 'VENCIDO' | 'A VENCER' | 'VENCE ESTE MÊS' | 'PENDENTE' | 'PAGO';
  diasAtraso: number;
}

export interface Expense {
  id: number;
  data: string;
  categoria: string;
  descricao: string;
  fornecedor: string;
  valor: number;
  formaPgto: string;
  nfRecibo: string;
  centroCusto: string;
  responsavel: string;
  status: 'PAGO' | 'PENDENTE' | 'CANCELADO';
}

export const EXPENSE_CATEGORIES = [
  'INFRAESTRUTURA', 'TERRAPLANAGEM', 'TOPOGRAFIA', 'CARTÓRIO',
  'IMPOSTOS/TAXAS', 'MARKETING/PUBLICIDADE', 'COMISSÕES',
  'ASSESSORIA JURÍDICA', 'CONTABILIDADE', 'MANUTENÇÃO',
  'EQUIPAMENTOS', 'MÃO DE OBRA', 'COMBUSTÍVEL',
  'MATERIAL DE ESCRITÓRIO', 'OUTROS'
];

export const PAYMENT_METHODS = ['PIX', 'TRANSFERÊNCIA', 'BOLETO', 'CARTÃO', 'DINHEIRO', 'CHEQUE'];

const salesData: Sale[] = [
  {id:1,nome:"EDSON APARECIDO LOPES DO CARMO",cpf:"122.908.516-55",quadra:2,lote:6,area:329.55,valor:142803,entrada:70000,dataEntrada:"2023-08-18",numParcelas:18,dataPrimeiraParcela:"2023-09-18",valorParcela:4044.61,situacao:"ATIVO",obs:""},
  {id:2,nome:"DEIVYSON OLIVEIRA SILVA",cpf:"113.862.546-90",quadra:2,lote:8,area:317.65,valor:137647,entrada:30000,dataEntrada:"2023-08-16",numParcelas:18,dataPrimeiraParcela:"2023-09-12",valorParcela:5980.38,situacao:"ATIVO",obs:""},
  {id:3,nome:"SIMONE JANAINA RODRIGUES CORREA",cpf:"115.296.356-24",quadra:2,lote:10,area:305.14,valor:132512,entrada:20000,dataEntrada:"2023-08-18",numParcelas:18,dataPrimeiraParcela:"2023-09-18",valorParcela:6250.66,situacao:"ATIVO",obs:""},
  {id:4,nome:"CLAUDIO SANTOS BORGES",cpf:"039.324.326-57",quadra:2,lote:19,area:314.96,valor:130000,entrada:130000,dataEntrada:"2023-08-18",numParcelas:0,dataPrimeiraParcela:null,valorParcela:0,situacao:"QUITADO",obs:""},
  {id:5,nome:"MARIA DO SOCORRO FERNANDES PEREIRA",cpf:"",quadra:3,lote:16,area:300,valor:0,entrada:0,dataEntrada:"2023-08-18",numParcelas:18,dataPrimeiraParcela:"2023-09-18",valorParcela:5000,situacao:"CANCELADO",obs:"VENDA CANCELADA"},
  {id:6,nome:"SEBASTIAO APARECIDO DE OLIVEIRA",cpf:"649.629.976-53",quadra:3,lote:17,area:300,valor:130000,entrada:29000,dataEntrada:"2023-08-18",numParcelas:18,dataPrimeiraParcela:"2023-09-15",valorParcela:5611.11,situacao:"ATIVO",obs:""},
  {id:7,nome:"WALDIRENE FONSECA DE AGUIAR",cpf:"",quadra:3,lote:13,area:300,valor:130000,entrada:20000,dataEntrada:"2023-08-30",numParcelas:24,dataPrimeiraParcela:"2023-09-20",valorParcela:4583.33,situacao:"ATIVO",obs:""},
  {id:8,nome:"ITAMARA MAGALHÃES DINIZ COELHO",cpf:"",quadra:11,lote:11,area:315,valor:136498,entrada:40000,dataEntrada:"2023-08-16",numParcelas:30,dataPrimeiraParcela:"2023-09-16",valorParcela:3216.6,situacao:"ATIVO",obs:""},
  {id:9,nome:"DULCIMAR DE MOURA",cpf:"",quadra:11,lote:13,area:315,valor:136498,entrada:80000,dataEntrada:"2023-08-18",numParcelas:18,dataPrimeiraParcela:"2023-09-18",valorParcela:3138.37,situacao:"ATIVO",obs:""},
  {id:10,nome:"VANDECILIANA SOARES MAGALHAES",cpf:"",quadra:11,lote:14,area:315,valor:136498,entrada:40000,dataEntrada:"2023-08-16",numParcelas:18,dataPrimeiraParcela:"2023-09-18",valorParcela:5361,situacao:"ATIVO",obs:""},
  {id:11,nome:"MARIA GERALDA SIQUEIRA DE ARAUJO",cpf:"049.602.476-06",quadra:12,lote:8,area:300,valor:130000,entrada:25000,dataEntrada:"2023-08-18",numParcelas:18,dataPrimeiraParcela:"2023-09-18",valorParcela:5833.33,situacao:"ATIVO",obs:""},
  {id:12,nome:"MARIA GERALDA SIQUEIRA DE ARAUJO",cpf:"049.602.476-06",quadra:3,lote:18,area:300,valor:135000,entrada:25000,dataEntrada:"2023-08-18",numParcelas:18,dataPrimeiraParcela:"2023-09-18",valorParcela:6111.11,situacao:"ATIVO",obs:""},
  {id:13,nome:"EDUARDO MARTINS",cpf:"137.794.676-23",quadra:2,lote:4,area:341.99,valor:148194,entrada:40000,dataEntrada:"2023-09-11",numParcelas:24,dataPrimeiraParcela:"2023-10-05",valorParcela:4508.08,situacao:"ATIVO",obs:""},
  {id:14,nome:"MICHAEL VERICH GREGÓRIO DA SILVA",cpf:"144.254.566-18",quadra:3,lote:19,area:300,valor:130000,entrada:30000,dataEntrada:"2023-09-15",numParcelas:25,dataPrimeiraParcela:"2023-11-15",valorParcela:4000,situacao:"ATIVO",obs:""},
  {id:15,nome:"MICHAEL VERICH GREGÓRIO DA SILVA",cpf:"",quadra:4,lote:18,area:305.14,valor:140575,entrada:38000,dataEntrada:"2023-09-19",numParcelas:25,dataPrimeiraParcela:"2023-10-15",valorParcela:4103,situacao:"ATIVO",obs:""},
  {id:16,nome:"DANILO MAGALHÃES DO CARMO",cpf:"103.493.466-07",quadra:1,lote:1,area:300,valor:100000,entrada:11666,dataEntrada:"2023-04-30",numParcelas:48,dataPrimeiraParcela:"2023-04-30",valorParcela:1840.29,situacao:"ATIVO",obs:""},
  {id:17,nome:"GUILHANE MARIA MAGALHÃES ASSUNÇÃO DO CARMO",cpf:"103.493.476-70",quadra:1,lote:2,area:300,valor:100000,entrada:11666,dataEntrada:"2023-04-30",numParcelas:48,dataPrimeiraParcela:"2023-04-30",valorParcela:1840.29,situacao:"ATIVO",obs:""},
  {id:18,nome:"FLAVIANO NAZARENO ASSUNÇÃO DO CARMO",cpf:"568.252.426-87",quadra:1,lote:3,area:300,valor:100000,entrada:11666,dataEntrada:"2023-04-30",numParcelas:48,dataPrimeiraParcela:"2023-04-30",valorParcela:1840.29,situacao:"ATIVO",obs:""},
  {id:19,nome:"FLAVIANO NAZARENO ASSUNÇÃO DO CARMO",cpf:"568.252.426-87",quadra:1,lote:4,area:300,valor:100000,entrada:11666,dataEntrada:"2023-04-30",numParcelas:48,dataPrimeiraParcela:"2023-04-30",valorParcela:1840.29,situacao:"ATIVO",obs:""},
  {id:20,nome:"FLAVIANO NAZARENO ASSUNÇÃO DO CARMO",cpf:"568.252.426-87",quadra:1,lote:5,area:300,valor:100000,entrada:11666,dataEntrada:"2023-04-30",numParcelas:48,dataPrimeiraParcela:"2023-04-30",valorParcela:1840.29,situacao:"ATIVO",obs:""},
  {id:21,nome:"FLAVIANO NAZARENO ASSUNÇÃO DO CARMO",cpf:"568.252.426-87",quadra:1,lote:6,area:301.80,valor:100000,entrada:11666,dataEntrada:"2023-04-30",numParcelas:48,dataPrimeiraParcela:"2023-04-30",valorParcela:1840.29,situacao:"ATIVO",obs:""},
  {id:22,nome:"Marta Helena Carvalhais Assunção",cpf:"",quadra:5,lote:28,area:290,valor:0,entrada:0,dataEntrada:null,numParcelas:0,dataPrimeiraParcela:null,valorParcela:0,situacao:"ATIVO",obs:""},
  {id:23,nome:"Marta Helena Carvalhais Assunção",cpf:"",quadra:5,lote:29,area:290,valor:0,entrada:0,dataEntrada:null,numParcelas:0,dataPrimeiraParcela:null,valorParcela:0,situacao:"ATIVO",obs:""},
  {id:24,nome:"Guilherme Keller Magalhães Coelho",cpf:"062.772.776-00",quadra:1,lote:7,area:300,valor:100000,entrada:10000,dataEntrada:"2023-10-19",numParcelas:48,dataPrimeiraParcela:"2023-11-19",valorParcela:1875,situacao:"ATIVO",obs:""},
  {id:25,nome:"Guilherme Keller Magalhães Coelho",cpf:"062.772.776-00",quadra:1,lote:8,area:300,valor:100000,entrada:10000,dataEntrada:"2023-10-19",numParcelas:48,dataPrimeiraParcela:"2023-11-19",valorParcela:1875,situacao:"ATIVO",obs:""},
  {id:26,nome:"Guilherme Keller Magalhães Coelho",cpf:"062.772.776-00",quadra:1,lote:9,area:300,valor:100000,entrada:10000,dataEntrada:"2023-10-19",numParcelas:48,dataPrimeiraParcela:"2023-11-19",valorParcela:1875,situacao:"ATIVO",obs:""},
  {id:27,nome:"Vander Lucio Barbosa Pereira",cpf:"",quadra:3,lote:12,area:300,valor:130000,entrada:45000,dataEntrada:"2023-11-07",numParcelas:48,dataPrimeiraParcela:"2023-12-12",valorParcela:2105.58,situacao:"ATIVO",obs:""},
  {id:28,nome:"Gilmar Damasceno De Oliveira",cpf:"",quadra:1,lote:21,area:0,valor:0,entrada:0,dataEntrada:null,numParcelas:0,dataPrimeiraParcela:null,valorParcela:0,situacao:"CANCELADO",obs:"VENDA CANCELADA"},
  {id:29,nome:"Eduardo Pereira Da Silva",cpf:"",quadra:15,lote:3,area:290,valor:130000,entrada:30000,dataEntrada:"2023-11-17",numParcelas:36,dataPrimeiraParcela:"2023-12-25",valorParcela:2777.78,situacao:"ATIVO",obs:""},
  {id:30,nome:"JOICE NATIELI GALVÃO DA SILVA",cpf:"019.759.346-10",quadra:3,lote:16,area:290,valor:130000,entrada:25000,dataEntrada:null,numParcelas:40,dataPrimeiraParcela:"2024-01-25",valorParcela:2625,situacao:"ATIVO",obs:""},
  {id:31,nome:"JOÃO PAULO LUCIO PEREIRA",cpf:"022.935.156-56",quadra:1,lote:22,area:290,valor:79000,entrada:15000,dataEntrada:null,numParcelas:40,dataPrimeiraParcela:"2024-01-25",valorParcela:1600,situacao:"ATIVO",obs:""},
  {id:32,nome:"MARIA DO SOCORRO DE FRANÇA",cpf:"027.418.946-12",quadra:2,lote:25,area:290,valor:136459.95,entrada:10000,dataEntrada:"2024-01-15",numParcelas:36,dataPrimeiraParcela:"2024-02-20",valorParcela:3512.78,situacao:"ATIVO",obs:"ENTRADA (2X)"},
  {id:33,nome:"JOSE AGNALDO DA COSTA",cpf:"",quadra:3,lote:11,area:0,valor:130000,entrada:0,dataEntrada:null,numParcelas:0,dataPrimeiraParcela:null,valorParcela:0,situacao:"CANCELADO",obs:"VENDA CANCELADA"},
  {id:34,nome:"DAIANE TEXEIRA DA SILVA",cpf:"133.331.266-05",quadra:3,lote:9,area:290,valor:130000,entrada:20000,dataEntrada:"2024-02-22",numParcelas:36,dataPrimeiraParcela:"2024-02-22",valorParcela:3055.55,situacao:"ATIVO",obs:""},
  {id:35,nome:"MARLON SILVA ALVES",cpf:"116.153.266-85",quadra:3,lote:10,area:290,valor:130000,entrada:25000,dataEntrada:null,numParcelas:30,dataPrimeiraParcela:"2024-04-25",valorParcela:3500,situacao:"ATIVO",obs:"Entrada Parcelada"},
  {id:36,nome:"ERICK DA COSTA DO SANTOS",cpf:"145.629.976-05",quadra:3,lote:14,area:290,valor:130000,entrada:20000,dataEntrada:"2024-05-20",numParcelas:36,dataPrimeiraParcela:"2024-06-15",valorParcela:5555.54,situacao:"ATIVO",obs:""},
  {id:37,nome:"ERICK DA COSTA DO SANTOS",cpf:"145.629.976-05",quadra:3,lote:15,area:290,valor:130000,entrada:20000,dataEntrada:"2024-05-20",numParcelas:36,dataPrimeiraParcela:"2024-06-15",valorParcela:5555.54,situacao:"ATIVO",obs:""},
  {id:38,nome:"DEISE APARECIDA COELHO",cpf:"087.131.856-32",quadra:3,lote:5,area:290,valor:130000,entrada:80000,dataEntrada:"2024-06-04",numParcelas:36,dataPrimeiraParcela:"2024-07-20",valorParcela:1041.66,situacao:"ATIVO",obs:"Entrada Tranf B"},
  {id:39,nome:"GISELE ALVES COELHO MACIEL",cpf:"103.889.526-01",quadra:3,lote:6,area:290,valor:130000,entrada:80000,dataEntrada:"2024-05-28",numParcelas:10,dataPrimeiraParcela:"2024-06-28",valorParcela:5000,situacao:"ATIVO",obs:"Entrada Tranf B"},
  {id:40,nome:"ROSIMERE DA CONCEIÇÃO SILVA",cpf:"042.337.416-86",quadra:3,lote:21,area:290,valor:130000,entrada:30000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-07-26",valorParcela:2777.77,situacao:"ATIVO",obs:"Entrada Trans B"},
  {id:41,nome:"ROSIMERE DA CONCEIÇÃO SILVA",cpf:"042.337.416-86",quadra:3,lote:22,area:290,valor:130000,entrada:30000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-07-26",valorParcela:2777.77,situacao:"ATIVO",obs:"Entrada Transf B"},
  {id:42,nome:"CLAUDIO SANTOS BORGES",cpf:"039.324.326-57",quadra:2,lote:19,area:290,valor:136477.28,entrada:40000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-07-17",valorParcela:2679.92,situacao:"ATIVO",obs:"Entrada Transf B"},
  {id:43,nome:"JOSE ANTONIO XAVIER",cpf:"169.369.676-20",quadra:3,lote:20,area:290,valor:130000,entrada:40000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-07-22",valorParcela:2500,situacao:"ATIVO",obs:"Entrada Transf B"},
  {id:44,nome:"RICARDO DAMASIO MOTA RABELO",cpf:"132.568.016-84",quadra:2,lote:23,area:290,valor:136468,entrada:32234,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-07-22",valorParcela:2895.33,situacao:"ATIVO",obs:"Entrada Transf B"},
  {id:45,nome:"RICARDO DAMASIO MOTA RABELO",cpf:"132.568.016-84",quadra:2,lote:24,area:290,valor:136464,entrada:32234,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-07-22",valorParcela:2895.33,situacao:"ATIVO",obs:"Entrada Transf B"},
  {id:46,nome:"SELMA DA CRUZ MAGALHÃES",cpf:"045.254.716-46",quadra:2,lote:3,area:348.27,valor:150515.83,entrada:20000,dataEntrada:"2025-01-30",numParcelas:47,dataPrimeiraParcela:"2024-08-30",valorParcela:1500,situacao:"ATIVO",obs:"APORTES R$ 10.000,00"},
  {id:47,nome:"SELMA DA CRUZ MAGALHÃES",cpf:"045.254.716-46",quadra:2,lote:2,area:354.55,valor:153637,entrada:20000,dataEntrada:"2025-01-30",numParcelas:47,dataPrimeiraParcela:"2024-08-30",valorParcela:1500,situacao:"ATIVO",obs:"APORTES R$ 10.000,00"},
  {id:48,nome:"DENISE SENA DE JESUS",cpf:"076.189.346-65",quadra:5,lote:10,area:300,valor:90000,entrada:10000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-09-15",valorParcela:2222.22,situacao:"ATIVO",obs:"ANTRADA E PIX (2X)"},
  {id:49,nome:"JHONATTA ALVES DE SENA",cpf:"163.222.396-19",quadra:5,lote:9,area:300,valor:90000,entrada:10000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-09-15",valorParcela:2222.22,situacao:"ATIVO",obs:"ANTRADA E PIX (1X)"},
  {id:50,nome:"KENIA CALISMARA COSTA DE LIMA",cpf:"107.015.546-22",quadra:2,lote:26,area:314.9,valor:136468,entrada:60000,dataEntrada:null,numParcelas:24,dataPrimeiraParcela:"2025-01-25",valorParcela:3186.16,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:51,nome:"LUCAS DANILO AFONSO ALMEIDA BELIZARIO",cpf:"090.891.346-03",quadra:3,lote:4,area:300,valor:130000,entrada:86666.64,dataEntrada:null,numParcelas:13,dataPrimeiraParcela:"2025-04-15",valorParcela:3333.33,situacao:"ATIVO",obs:"BOLETO E TRANSF. BAN"},
  {id:52,nome:"KEMILLY KEITY DE FIGUEIREDO",cpf:"182.745.496-27",quadra:3,lote:12,area:300,valor:145000,entrada:40000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2025-05-15",valorParcela:2916.67,situacao:"ATIVO",obs:"APORTES R$ 10.000,00"},
  {id:53,nome:"MARISA APARECIDA ANTUNES",cpf:"330.898.088-62",quadra:5,lote:2,area:301.38,valor:90000,entrada:15000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2025-05-25",valorParcela:2083.33,situacao:"ATIVO",obs:"ANTRADA/PIX (2X)"},
  {id:54,nome:"MARISA APARECIDA ANTUNES",cpf:"330.898.088-62",quadra:5,lote:3,area:308.24,valor:90000,entrada:15000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2025-05-25",valorParcela:2083.33,situacao:"ATIVO",obs:"ANTRADA/PIX (2X)"},
  {id:55,nome:"FLAVIANO ASSUNÇÃO PEREIRA",cpf:"032.680.876-04",quadra:2,lote:28,area:314.89,valor:151500,entrada:15750,dataEntrada:null,numParcelas:48,dataPrimeiraParcela:"2025-06-15",valorParcela:2828.13,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:56,nome:"FLAVIANO ASSUNÇÃO PEREIRA",cpf:"032.680.876-04",quadra:2,lote:29,area:314.88,valor:151500,entrada:15750,dataEntrada:null,numParcelas:48,dataPrimeiraParcela:"2025-06-15",valorParcela:2828.13,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:57,nome:"HENRIQUE ANDRADE DA SILVA LEITE",cpf:"154.231.206-08",quadra:14,lote:1,area:297.27,valor:143816,entrada:15000,dataEntrada:null,numParcelas:48,dataPrimeiraParcela:"2025-08-25",valorParcela:2683.67,situacao:"ATIVO",obs:"ENTRADA"},
  {id:58,nome:"ERICA GERALDA FIGUEIREDO FONSECA",cpf:"122.502.936-86",quadra:4,lote:18,area:315.5,valor:155848,entrada:10000,dataEntrada:"2025-07-31",numParcelas:44,dataPrimeiraParcela:"2026-01-20",valorParcela:2830.16,situacao:"ATIVO",obs:""},
  {id:59,nome:"ERICA GERALDA FIGUEIREDO FONSECA",cpf:"122.502.936-86",quadra:4,lote:17,area:315.5,valor:150848,entrada:10000,dataEntrada:"2025-07-31",numParcelas:44,dataPrimeiraParcela:"2026-01-20",valorParcela:2830.16,situacao:"ATIVO",obs:"ENTRADA"},
  {id:60,nome:"TERESINHA APARECIDA SILVA SANTOS",cpf:"141.049.476-44",quadra:3,lote:26,area:300,valor:145000,entrada:20000,dataEntrada:"2025-08-04",numParcelas:36,dataPrimeiraParcela:"2025-09-20",valorParcela:3472.22,situacao:"ATIVO",obs:""},
  {id:61,nome:"MARCOS CAMPOS NOGUEIRA",cpf:"142.414.776-07",quadra:10,lote:13,area:366.05,valor:180000,entrada:20000,dataEntrada:"2025-08-05",numParcelas:48,dataPrimeiraParcela:"2025-09-18",valorParcela:3333.33,situacao:"ATIVO",obs:"ENTRADA / PIX"},
  {id:62,nome:"Marta Helena Carvalhais Assunção",cpf:"010.593.846-71",quadra:5,lote:27,area:300,valor:0,entrada:70000,dataEntrada:"2025-07-31",numParcelas:0,dataPrimeiraParcela:null,valorParcela:0,situacao:"ATIVO",obs:""},
  {id:63,nome:"Marta Helena Carvalhais Assunção",cpf:"010.593.846-71",quadra:5,lote:26,area:300,valor:0,entrada:70000,dataEntrada:"2025-07-31",numParcelas:0,dataPrimeiraParcela:null,valorParcela:0,situacao:"ATIVO",obs:"ENTRADA/PIX"},
  {id:64,nome:"LETICIA COELHO MADEIRA",cpf:"101.471.266-14",quadra:4,lote:10,area:313.5,valor:150848,entrada:15084.8,dataEntrada:"2025-08-15",numParcelas:48,dataPrimeiraParcela:"2025-09-15",valorParcela:2822.9,situacao:"ATIVO",obs:"ENTRADA/PIX"},
  {id:65,nome:"WAGNER TIAGO DOS REIS",cpf:"119.485.706-02",quadra:4,lote:9,area:313.5,valor:150848,entrada:15084.8,dataEntrada:"2025-08-13",numParcelas:48,dataPrimeiraParcela:"2025-09-10",valorParcela:2822.9,situacao:"ATIVO",obs:"ENTRADA/PIX"},
  {id:66,nome:"REGIANE KELLY DA CRUZ",cpf:"016.019.256-03",quadra:2,lote:9,area:311.73,valor:149800,entrada:15800,dataEntrada:"2025-09-04",numParcelas:40,dataPrimeiraParcela:"2025-10-10",valorParcela:3350,situacao:"ATIVO",obs:"ENTRADA/PIX"},
  {id:67,nome:"LAUREANA PEREIRA DOS SANTOS",cpf:"328.096.648-54",quadra:5,lote:7,area:300,valor:102000,entrada:102000,dataEntrada:null,numParcelas:0,dataPrimeiraParcela:null,valorParcela:0,situacao:"QUITADO",obs:"PAGAMENTO INTEGRAL"},
  {id:68,nome:"JUAREZ FRANCIS DE ARAUJO",cpf:"044.746.116-83",quadra:11,lote:12,area:315,valor:170000,entrada:40000,dataEntrada:"2025-09-24",numParcelas:48,dataPrimeiraParcela:"2025-10-12",valorParcela:2708.33,situacao:"ATIVO",obs:""},
  {id:69,nome:"MARIA JOSE FERREIRA TOMAZ",cpf:"071.874.336-10",quadra:14,lote:2,area:313.5,valor:150848,entrada:20000,dataEntrada:"2025-10-29",numParcelas:48,dataPrimeiraParcela:"2025-12-25",valorParcela:2726,situacao:"ATIVO",obs:""},
  {id:70,nome:"JANICE APARECIDA FREITAS SILVA",cpf:"107.620.126-17",quadra:3,lote:11,area:300,valor:160000,entrada:16000,dataEntrada:"2025-10-24",numParcelas:48,dataPrimeiraParcela:"2025-12-15",valorParcela:3000,situacao:"ATIVO",obs:""},
  {id:71,nome:"WIPSON HELIO CARVALHO DA SILVA",cpf:"116.733.716-63",quadra:2,lote:7,area:323.58,valor:175500,entrada:80000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2026-04-12",valorParcela:2652.77,situacao:"ATIVO",obs:""},
  {id:72,nome:"MARIA HELENA PIMENTA DO CARMO",cpf:"027.793.106-18",quadra:8,lote:16,area:224,valor:89500,entrada:0,dataEntrada:null,numParcelas:50,dataPrimeiraParcela:"2026-03-05",valorParcela:1790,situacao:"ATIVO",obs:""},
  {id:73,nome:"KEMILLY KEITY DE FIGUEIREDO",cpf:"182.745.496-27",quadra:3,lote:25,area:300,valor:145000,entrada:10000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2026-02-05",valorParcela:3750,situacao:"ATIVO",obs:""},
  {id:74,nome:"RICARDO EVASIO PEREIRA DE MOURA",cpf:"084.286.786-42",quadra:3,lote:24,area:300,valor:130000,entrada:20000,dataEntrada:null,numParcelas:24,dataPrimeiraParcela:"2024-09-20",valorParcela:4583.33,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:75,nome:"ROGERIO ADAILSON CAMPOS OLIVEIRA",cpf:"151.859.856-07",quadra:5,lote:17,area:300,valor:90000,entrada:20000,dataEntrada:"2023-11-25",numParcelas:36,dataPrimeiraParcela:"2024-01-25",valorParcela:1944.44,situacao:"ATIVO",obs:""},
  {id:76,nome:"JOÃO MAGNO DE SOUZA FIGUEIREDO",cpf:"093.878.426-90",quadra:2,lote:22,area:314.94,valor:136468,entrada:25000,dataEntrada:null,numParcelas:24,dataPrimeiraParcela:"2024-11-25",valorParcela:4645.75,situacao:"ATIVO",obs:"ENTRADA PARCELADA"},
  {id:77,nome:"ROBERTH BARRETO DE OLIVEIRA",cpf:"168.237.326-60",quadra:13,lote:3,area:323.85,valor:153436.80,entrada:30000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-06-01",valorParcela:3428.80,situacao:"ATIVO",obs:"ENTRADA PARCELADA"},
  {id:78,nome:"UDISSON MESSIAS DA SILVA CHAVES",cpf:"145.055.786-40",quadra:3,lote:23,area:300,valor:130000,entrada:30000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-08-15",valorParcela:2777.78,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:79,nome:"ADRIANA DE SOUZA RODRIGUES DA SILVA",cpf:"085.020.546-86",quadra:3,lote:7,area:300,valor:130000,entrada:40000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-11-29",valorParcela:2500,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:80,nome:"DAVID DE SOUZA",cpf:"138.233.656-06",quadra:14,lote:6,area:319.28,valor:138310.26,entrada:30000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-07-15",valorParcela:3008.61,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:81,nome:"ODERCI RIBEIRO DOS SANTOS",cpf:"662.899.126-15",quadra:2,lote:27,area:314.89,valor:136455.28,entrada:80000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-08-28",valorParcela:1568.20,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:82,nome:"REGINALDO NATIVIDADE DOS SANTOS",cpf:"057.817.626-20",quadra:3,lote:8,area:300,valor:130000,entrada:30000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-02-25",valorParcela:2777.77,situacao:"ATIVO",obs:"ENTRADA PARCELADA"},
  {id:83,nome:"PATRICIA ROSALIA DOS SANTOS",cpf:"156.045.186-00",quadra:5,lote:13,area:300,valor:90000,entrada:15000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-08-15",valorParcela:2083.33,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:84,nome:"PATRICIA ROSALIA DOS SANTOS",cpf:"156.045.186-00",quadra:5,lote:12,area:300,valor:90000,entrada:15000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-08-15",valorParcela:2083.33,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:85,nome:"VANDER LUCIO BARBOSA PEREIRA",cpf:"704.411.466-00",quadra:5,lote:6,area:300,valor:90000,entrada:18000,dataEntrada:null,numParcelas:30,dataPrimeiraParcela:"2024-08-10",valorParcela:2400,situacao:"ATIVO",obs:"BOLETOS ANTERIORES"},
  {id:86,nome:"JUSCELI FERREIRA XAVIER",cpf:"134.441.126-61",quadra:5,lote:8,area:300,valor:90000,entrada:10000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-08-28",valorParcela:2222.22,situacao:"ATIVO",obs:"TRANSF. BANCÁRIA"},
  {id:87,nome:"MARIA DO CARMO ALVES DE OLIVEIRA",cpf:"047.681.727-76",quadra:13,lote:2,area:313.41,valor:150436.80,entrada:55000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-08-15",valorParcela:2651.02,situacao:"ATIVO",obs:"ENTRADA PARCELADA"},
  {id:88,nome:"DORIEDSON ROMULO SOARES",cpf:"070.430.756-10",quadra:5,lote:16,area:300,valor:87000,entrada:87000,dataEntrada:null,numParcelas:0,dataPrimeiraParcela:null,valorParcela:0,situacao:"QUITADO",obs:"PAGAMENTO INTEGRAL"},
  {id:89,nome:"EDMAR LIMA DOS SANTOS",cpf:"047.544.296-21",quadra:5,lote:11,area:300,valor:90000,entrada:10000,dataEntrada:null,numParcelas:36,dataPrimeiraParcela:"2024-09-15",valorParcela:2222.22,situacao:"ATIVO",obs:""},
];

const lotsData: Lot[] = [
  {quadra:1,lote:1,area:300.0,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"Danilo Magalhães Assunção Do Carmo",cpf:"103.493.466-07",inscricao:"01.01.001.0280.001"},
  {quadra:1,lote:2,area:300.0,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"Guilhane Maria Magalhães Assunção Do C.",cpf:"103.493.476-70",inscricao:"01.01.001.0292.001"},
  {quadra:1,lote:3,area:300.0,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"Flaviano Nazareno Assunção Do Carmo",cpf:"568.252.426-87",inscricao:"01.01.001.0304.001"},
  {quadra:1,lote:4,area:300.0,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"Flaviano Nazareno Assunção Do Carmo",cpf:"568.252.426-87",inscricao:"01.01.001.0316.001"},
  {quadra:1,lote:5,area:300.0,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"Flaviano Nazareno Assunção Do Carmo",cpf:"568.252.426-87",inscricao:"01.01.001.0328.001"},
  {quadra:1,lote:6,area:301.8,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"Flaviano Nazareno Assunção Do Carmo",cpf:"568.252.426-87",inscricao:"01.01.001.0340.001"},
  {quadra:1,lote:7,area:300.0,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"Guilherme Keller Magalhães Coelho",cpf:"062.772776-00",inscricao:"01.01.001.0352.001"},
  {quadra:1,lote:8,area:300.0,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"Guilherme Keller Magalhães Coelho",cpf:"062.772776-00",inscricao:"01.01.001.0364.001"},
  {quadra:1,lote:9,area:300.0,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"Guilherme Keller Magalhães Coelho",cpf:"062.772776-00",inscricao:"01.01.001.0376.001"},
  {quadra:1,lote:10,area:353.43,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0100.001"},
  {quadra:1,lote:11,area:512.15,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0112.001"},
  {quadra:1,lote:12,area:322.92,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0124.001"},
  {quadra:1,lote:13,area:315.45,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0136.001"},
  {quadra:1,lote:14,area:310.05,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0148.001"},
  {quadra:1,lote:15,area:360.6,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0160.001"},
  {quadra:1,lote:16,area:409.55,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0172.001"},
  {quadra:1,lote:17,area:381.56,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0184.001"},
  {quadra:1,lote:18,area:355.42,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0268.001"},
  {quadra:1,lote:19,area:367.01,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0208.001"},
  {quadra:1,lote:20,area:324.0,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0220.001"},
  {quadra:1,lote:21,area:324.0,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0232.001"},
  {quadra:1,lote:22,area:324.0,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"JOÃO PAULO LUCIO PEREIRA",cpf:"022.935156-56",inscricao:"01.01.001.0244.001"},
  {quadra:1,lote:23,area:324.0,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.001.0256.001"},
  {quadra:2,lote:1,area:441.64,rua:"Rua Vista Alegre",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.003.0342.001"},
  {quadra:2,lote:2,area:354.55,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"SELMA DA CRUZ MAGALHÃES",cpf:"045.254.716-46",inscricao:"01.01.003.0438.001"},
  {quadra:2,lote:3,area:348.27,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"SELMA DA CRUZ MAGALHÃES",cpf:"045.254.716-46",inscricao:"01.01.003.0450.001"},
  {quadra:2,lote:4,area:341.99,rua:"Rua Vista Alegre",situacao:"QUITADO",proprietario:"EDUARDO MARTINS",cpf:"137.794.676-23",inscricao:"01.01.003.0354.001"},
  {quadra:2,lote:5,area:335.71,rua:"Rua Vista Alegre",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.003.0366.001"},
  {quadra:2,lote:6,area:329.55,rua:"Rua Vista Alegre",situacao:"QUITADO",proprietario:"EDSON APARECIDO LOPES DO CARMO",cpf:"122.908.516-55",inscricao:"01.01.003.0462.001"},
  {quadra:2,lote:7,area:323.58,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"WIPSON HELIO CARVALHO DA SILVA",cpf:"116.733.716-63",inscricao:"01.01.003.0378.001"},
  {quadra:2,lote:8,area:317.65,rua:"Rua Vista Alegre",situacao:"QUITADO",proprietario:"DEIVYSON OLIVEIRA SILVA",cpf:"113.862.546-90",inscricao:"01.01.003.0390.001"},
  {quadra:2,lote:9,area:311.73,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"REGIANE KELLY DA CRUZ",cpf:"016.019.256-03",inscricao:"01.01.003.0402.001"},
  {quadra:2,lote:10,area:305.8,rua:"Rua Vista Alegre",situacao:"QUITADO",proprietario:"SIMONE JANAINA RODRIGUES CORREA",cpf:"115.296.356-24",inscricao:"01.01.003.0414.001"},
  {quadra:2,lote:11,area:301.9,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.003.0426.001"},
  {quadra:2,lote:12,area:305.14,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.003.0474.001"},
  {quadra:2,lote:13,area:309.0,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.003.0486.001"},
  {quadra:2,lote:14,area:312.85,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.003.0498.001"},
  {quadra:2,lote:15,area:316.71,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.003.0510.001"},
  {quadra:2,lote:16,area:314.99,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.085.0796.001"},
  {quadra:2,lote:17,area:314.98,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.085.0808.001"},
  {quadra:2,lote:18,area:314.97,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.085.0820.001"},
  {quadra:2,lote:19,area:314.96,rua:"Rua José de Souza Madeira",situacao:"QUITADO",proprietario:"CLAUDIO SANTOS BORGES/2023",cpf:"039.324.326-57",inscricao:"/ CADASTRADO"},
  {quadra:2,lote:20,area:314.95,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"CLAUDIO SANTOS BORGES/2024",cpf:"039.324.326-57",inscricao:"01.01.085.0544.001"},
  {quadra:2,lote:21,area:314.95,rua:"Rua José de Souza Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.085.0832.001"},
  {quadra:2,lote:22,area:314.24,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"JOÃO MAGNO DE SOUZA FIGUEIREDO",cpf:"093.878.426-90",inscricao:"01.01.085.0556.001"},
  {quadra:2,lote:23,area:314.93,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"RICARDO DAMASIO MOTA RABELO",cpf:"132.568.016-84",inscricao:"01.01.085.0568.001"},
  {quadra:2,lote:24,area:314.92,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"RICARDO DAMASIO MOTA RABELO",cpf:"132.568.016-84",inscricao:"01.01.085.0580.001"},
  {quadra:2,lote:25,area:314.91,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"MARIA DO SOCORRO DE FRANCA",cpf:"027.418.946-12",inscricao:"01.01.085.0844.001"},
  {quadra:2,lote:26,area:314.9,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"KENIA CALISMARA COSTA DE LIMA",cpf:"107.015.546-22",inscricao:"01.01.085.0856.001"},
  {quadra:2,lote:27,area:314.89,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"ODERCI RIBEIRO DOS SANTOS",cpf:"662.899.126-15",inscricao:"01.01.085.0592.001"},
  {quadra:2,lote:28,area:314.89,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"FLAVIANO ASSUNÇÃO PEREIRA",cpf:"032.680.876-04",inscricao:"01.01.085.0604.001"},
  {quadra:2,lote:29,area:314.88,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"FLAVIANO ASSUNÇÃO PEREIRA",cpf:"032.680.876-04",inscricao:"01.01.085.0616.001"},
  {quadra:2,lote:30,area:394.48,rua:"Rua José de Souza Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.085.0532.001"},
  {quadra:3,lote:1,area:292.63,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.003.0010.001"},
  {quadra:3,lote:2,area:334.6,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.003.0046.001"},
  {quadra:3,lote:3,area:331.8,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.003.0034.001"},
  {quadra:3,lote:4,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"LUCAS DANILO AFONSO ALMEIDA BELIZARIO",cpf:"090.891.346-03",inscricao:"01.01.085.0868.001"},
  {quadra:3,lote:5,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"DEISE APARECIDA COELHO",cpf:"087.131.856-32",inscricao:""},
  {quadra:3,lote:6,area:300.0,rua:"Rua José de Souza Madeira",situacao:"QUITADO",proprietario:"GISELE ALVES COELHO MACIEL",cpf:"103.889.526-01",inscricao:"01.01.085.0628.001"},
  {quadra:3,lote:7,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"ADRIANA DE SOUZA RODRIGUES DA SILVA",cpf:"085.020.546-86",inscricao:"01.01.085.0640.001"},
  {quadra:3,lote:8,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"REGINALDO NATIVIDADE DOS SANTOS",cpf:"057.817.626-20",inscricao:"01.01.085.0652.001"},
  {quadra:3,lote:9,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"DAIANE TEXEIRA DA SILVA",cpf:"133.331.266-05",inscricao:"01.01.085.0664.001"},
  {quadra:3,lote:10,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"MARLON SILVA ALVES",cpf:"116.153.266-85",inscricao:"01.01.085.0676.001"},
  {quadra:3,lote:11,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"JANICE APARECIDA FREITAS SILVA",cpf:"107.620.126-17",inscricao:"01.01.085.0688.001"},
  {quadra:3,lote:12,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"KEMILLY KEITY DE FIGUEIREDO",cpf:"182.745.496-27",inscricao:"01.01.085.0880.001"},
  {quadra:3,lote:13,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"WALDIRENE FONSECA DE AGUIAR",cpf:"128.904.986-62",inscricao:"01.01.085.0700.001"},
  {quadra:3,lote:14,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"ERICK DA COSTA DO SANTOS",cpf:"145.629.976-05",inscricao:"01.01.085.0712.001"},
  {quadra:3,lote:15,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"ERICK DA COSTA DO SANTOS",cpf:"145.629.976-05",inscricao:"01.01.085.0724.001"},
  {quadra:3,lote:16,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"JOICE NATIELI GALVÃO DA SILVA",cpf:"019.759.346-10",inscricao:"01.01.085.0736.001"},
  {quadra:3,lote:17,area:300.0,rua:"Rua José de Souza Madeira",situacao:"QUITADO",proprietario:"SEBASTIÃO APARECIDO DE OLIVEIRA",cpf:"649.629.976-53",inscricao:"01.01.085.0520.001 /CADASTRADO"},
  {quadra:3,lote:18,area:300.0,rua:"Rua José de Souza Madeira",situacao:"QUITADO",proprietario:"MARIA GERALDA SIQUEIRA DE ARAUJO",cpf:"049.602.476-06",inscricao:"01.01.085.0892.001"},
  {quadra:3,lote:19,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"MICHAEL UERICH GREGÓRIO DA SILVA",cpf:"144.425.456-18",inscricao:"01.01.087.0291.001"},
  {quadra:3,lote:20,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"JOSE ANTONIO XAVIER",cpf:"169.369.676-20",inscricao:"01.01.087.0303.001"},
  {quadra:3,lote:21,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"ROSIMERE DA CONCEIÇÃO SILVA",cpf:"042.337.416-86",inscricao:"01.01.087.0315.001"},
  {quadra:3,lote:22,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"ROSIMERE DA CONCEIÇÃO SILVA",cpf:"042.337.416-86",inscricao:"01.01.087.0327.001"},
  {quadra:3,lote:23,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"UDISSON MESSIAS DA SILVA CHAVES",cpf:"145.055.786-40",inscricao:"01.01.087.0339.001"},
  {quadra:3,lote:24,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"RICARDO EVASIO PEREIRA DE MOURA",cpf:"084.286.786-42",inscricao:"01.01.087.0351.001"},
  {quadra:3,lote:25,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"KEMILLY KEITY DE FIGUEIREDO",cpf:"182.735.496-27",inscricao:"01.01.087.0363.001"},
  {quadra:3,lote:26,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"TERESINHA APARECIDA SILVA SANTOS",cpf:"141.049.476-44",inscricao:"01.01.087.0375.001"},
  {quadra:3,lote:27,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0387.001"},
  {quadra:3,lote:28,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0399.001"},
  {quadra:3,lote:29,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0411.001"},
  {quadra:3,lote:30,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0423.001"},
  {quadra:3,lote:31,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0435.001"},
  {quadra:3,lote:32,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0447.001"},
  {quadra:3,lote:33,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0459.001"},
  {quadra:3,lote:34,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0471.001"},
  {quadra:3,lote:35,area:303.93,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0483.001"},
  {quadra:4,lote:1,area:309.72,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.004.0010.001"},
  {quadra:4,lote:2,area:305.23,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.004.0022.001"},
  {quadra:4,lote:3,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0495.003"},
  {quadra:4,lote:4,area:355.94,rua:"Rua Rosana Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.088.0432.001"},
  {quadra:4,lote:5,area:260.12,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0507.001"},
  {quadra:4,lote:6,area:311.9,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0519.001"},
  {quadra:4,lote:7,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0531.001"},
  {quadra:4,lote:8,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0543.001"},
  {quadra:4,lote:9,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"WAGNER TIAGO DOS REIS",cpf:"119.485.706-02",inscricao:"01.01.087.0555.001"},
  {quadra:4,lote:10,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"LETICA COELHO MADEIRA",cpf:"101.471.266-14",inscricao:"01.01.087.0567.001"},
  {quadra:4,lote:11,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0579.001"},
  {quadra:4,lote:12,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0591.001"},
  {quadra:4,lote:13,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0603.001"},
  {quadra:4,lote:14,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0615.001"},
  {quadra:4,lote:15,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0627.001"},
  {quadra:4,lote:16,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0639.001"},
  {quadra:4,lote:17,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"ERICA GERALDA FIGUEIREDO FONSECA",cpf:"122.502.936-86",inscricao:"01.01.087.0651.001"},
  {quadra:4,lote:18,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"ERICA GERALDA FIGUEIREDO FONSECA",cpf:"122.502.936-86",inscricao:"01.01.087.0633.001"},
  {quadra:5,lote:1,area:533.94,rua:"Rua Antônia Padilha da Silva",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.005.0010.001"},
  {quadra:5,lote:2,area:301.38,rua:"Rua Antônia Padilha da Silva",situacao:"VENDIDO",proprietario:"MARISA APARECIDA ANTUNES",cpf:"330.898.088-62",inscricao:"01.01.005.0022.001"},
  {quadra:5,lote:3,area:308.24,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"MARISA APARECIDA ANTUNES",cpf:"330.898.088-62",inscricao:"01.01.088.0444.001"},
  {quadra:5,lote:4,area:300.0,rua:"Rua Rosana Madeira",situacao:"QUITADO",proprietario:"MICHAEL UERICH GREGÓRIO DA SILVA",cpf:"144.425.456-18",inscricao:"01.01.088.0168.001"},
  {quadra:5,lote:5,area:385.18,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"VANDER LÚCIO BARBOSA PEREIRA",cpf:"704.411.466-00",inscricao:"01.01.088.0180.001"},
  {quadra:5,lote:6,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"VANDER LUCIO BARBOSA PEREIRA",cpf:"704.411.466-00",inscricao:"01.01.088.0192.001"},
  {quadra:5,lote:7,area:300.0,rua:"Rua Rosana Madeira",situacao:"QUITADO",proprietario:"LAUREANA PEREIRA DOS SANTOS",cpf:"328.096.648-54",inscricao:"01.01.088.0204.001"},
  {quadra:5,lote:8,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"JUSCILEI FERREIRA XAVIER",cpf:"134.441.126-61",inscricao:"01.01.088.0216.001"},
  {quadra:5,lote:9,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"JHONATTA ALVES DE SENA",cpf:"163.222.396-19",inscricao:"01.01.088.0456.001"},
  {quadra:5,lote:10,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"DENISE SENA DE JESUS",cpf:"076.189.346-65",inscricao:"01.01.088.0468.001"},
  {quadra:5,lote:11,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"EDMAR LIMA DOS SANTOS",cpf:"047.544.296-21",inscricao:"01.01.088.0228.001"},
  {quadra:5,lote:12,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"PATRICIA ROSALIA DOS SANTOS",cpf:"156.045.186-62",inscricao:"01.01.088.0240.001"},
  {quadra:5,lote:13,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"PATRICIA ROSALIA DOS SANTOS",cpf:"156.045.186-62",inscricao:"01.01.088.0252.001"},
  {quadra:5,lote:14,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"ANA VITÓRIA RODRIGUES SILVA",cpf:"154.882.136-51",inscricao:"01.01.088.0264.001"},
  {quadra:5,lote:15,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"ANA VITÓRIA RODRIGUES SILVA",cpf:"154.882.136-51",inscricao:"01.01.088.0276.001"},
  {quadra:5,lote:16,area:300.0,rua:"Rua Rosana Madeira",situacao:"QUITADO",proprietario:"DORIEDSON ROMULO SOARES",cpf:"070.430.756-10",inscricao:"01.01.088.0288.001"},
  {quadra:5,lote:17,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"ROGERIO ADILSON CAMPOS OLIVEIRA",cpf:"151.859.856-07",inscricao:"/CADASTRADO"},
  {quadra:5,lote:18,area:374.66,rua:"Rua Rosana Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.088.0300.001"},
  {quadra:5,lote:19,area:300.0,rua:"Rua Rosana Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.088.0312.001"},
  {quadra:5,lote:20,area:300.0,rua:"Rua Rosana Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.088.0324.001"},
  {quadra:5,lote:21,area:300.0,rua:"Rua Rosana Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.088.0336.001"},
  {quadra:5,lote:22,area:300.0,rua:"Rua Rosana Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.088.0348.001"},
  {quadra:5,lote:23,area:300.0,rua:"Rua Rosana Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.088.0360.001"},
  {quadra:5,lote:24,area:300.0,rua:"Rua Rosana Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.088.0372.001"},
  {quadra:5,lote:25,area:300.0,rua:"Rua Rosana Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.088.0384.001"},
  {quadra:5,lote:26,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"Marta Helena Carvalhais Assunção",cpf:"010.593.846-71",inscricao:"01.01.088.0396.001"},
  {quadra:5,lote:27,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"Marta Helena Carvalhais Assunção",cpf:"010.593.846-71",inscricao:"01.01.088.0480.001"},
  {quadra:5,lote:28,area:300.0,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"Marta Helena Carvalhais Assunção",cpf:"010.593.846-71",inscricao:"01.01.088.0408.001"},
  {quadra:5,lote:29,area:389.07,rua:"Rua Rosana Madeira",situacao:"VENDIDO",proprietario:"Marta Helena Carvalhais Assunção",cpf:"010.593.846-71",inscricao:"01.01.088.0420.001"},
  {quadra:6,lote:1,area:422.37,rua:"RUA OMAR PADILHA",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:6,lote:2,area:419.68,rua:"RUA OMAR PADILHA",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:6,lote:3,area:395.96,rua:"RUA OMAR PADILHA",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:6,lote:4,area:372.25,rua:"RUA OMAR PADILHA",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:6,lote:5,area:528.84,rua:"JOSÉ DE SOUZA MADEIRA",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:6,lote:6,area:448.43,rua:"JOSÉ DE SOUZA MADEIRA",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:6,lote:7,area:484.5,rua:"JOSÉ DE SOUZA MADEIRA",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:6,lote:8,area:505.13,rua:"JOSÉ DE SOUZA MADEIRA",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:6,lote:9,area:571.1,rua:"JOSÉ DE SOUZA MADEIRA",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:6,lote:10,area:370.52,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.006.0010.001"},
  {quadra:6,lote:11,area:376.8,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"/CADASTRADO"},
  {quadra:6,lote:12,area:394.21,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.006.0022.001"},
  {quadra:6,lote:13,area:380.54,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.006.0034.001"},
  {quadra:10,lote:13,area:366.05,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"MARCOS CAMPOS NOGUEIRA",cpf:"142.414.776-07",inscricao:"01.01.087.0159.001"},
  {quadra:10,lote:16,area:261.39,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.006.0046.001"},
  {quadra:10,lote:17,area:258.56,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.006.0070.001"},
  {quadra:10,lote:18,area:262.9,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.006.0082.001"},
  {quadra:10,lote:19,area:267.25,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.006.0094.001"},
  {quadra:10,lote:20,area:263.75,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.006.0106.001"},
  {quadra:11,lote:1,area:536.57,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.011.0010.001"},
  {quadra:11,lote:2,area:313.11,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.011.0022.001"},
  {quadra:11,lote:3,area:309.7,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.011.0034.001"},
  {quadra:11,lote:4,area:306.29,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.011.0058.001"},
  {quadra:11,lote:5,area:302.91,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.011.0070.001"},
  {quadra:11,lote:6,area:383.68,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.011.0082.001"},
  {quadra:11,lote:7,area:507.37,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.011.0106.001"},
  {quadra:11,lote:8,area:346.98,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.085.1180.001"},
  {quadra:11,lote:9,area:315.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.085.1192.001"},
  {quadra:11,lote:10,area:315.0,rua:"Rua José de Souza Madeira",situacao:"QUITADO",proprietario:"WEBERTE ANTONIO PAINS",cpf:"015.547.306-94",inscricao:"/CADASTRADO"},
  {quadra:11,lote:11,area:315.0,rua:"Rua José de Souza Madeira",situacao:"QUITADO",proprietario:"ITAMARA MAGALHÃES DINIZ COELHO",cpf:"063.687.156-85",inscricao:"/CADASTRADO"},
  {quadra:11,lote:12,area:315.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"JUAREZ FRANCIS DE ARAUJO",cpf:"044.746.116-83",inscricao:"01.01.085.0748.001"},
  {quadra:11,lote:13,area:315.0,rua:"Rua José de Souza Madeira",situacao:"QUITADO",proprietario:"DULCIMAR DE MOURA",cpf:"052.309.976-21",inscricao:"/CADASTRADO"},
  {quadra:11,lote:14,area:315.0,rua:"Rua José de Souza Madeira",situacao:"QUITADO",proprietario:"VANDECILIANA SOARES MAGALHÃES",cpf:"086.723.716-31",inscricao:"01.01.085.0508.001   /CADASTRADO"},
  {quadra:11,lote:15,area:315.0,rua:"Rua José de Souza Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.085.0760.001"},
  {quadra:11,lote:16,area:359.02,rua:"Rua José de Souza Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.085.0772.001"},
  {quadra:12,lote:8,area:300.0,rua:"Rua Sebastião Madeira",situacao:"QUITADO",proprietario:"MARIA GERALDA SIQUEIRA DE ARAUJO",cpf:"049.602.476-06",inscricao:"01.01.087.0171.001"},
  {quadra:13,lote:1,area:322.64,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:13,lote:2,area:313.41,rua:"Rua Zilda Padilha",situacao:"VENDIDO",proprietario:"MARIA DO CARMO ALVES DE OLIVEIRA",cpf:"047.681.727-76",inscricao:"01.01.013.0020.001"},
  {quadra:13,lote:3,area:323.85,rua:"Rua Zilda Padilha",situacao:"VENDIDO",proprietario:"ROBERTH BARRETO DE OLIVEIRA",cpf:"168.237326-60",inscricao:"01.01.013.0032.001"},
  {quadra:13,lote:4,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.085.1204.001"},
  {quadra:13,lote:5,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.085.1216.001"},
  {quadra:13,lote:6,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.085.1228.001"},
  {quadra:13,lote:7,area:300.0,rua:"Rua José de Souza Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.085.0784.001"},
  {quadra:13,lote:8,area:309.15,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.087.0759.001"},
  {quadra:13,lote:9,area:331.9,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.087.0219.001"},
  {quadra:13,lote:10,area:292.19,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.087.0231.001"},
  {quadra:13,lote:11,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.087.0771.001"},
  {quadra:13,lote:12,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:"01.01.087.0783.001"},
  {quadra:13,lote:13,area:300.0,rua:"Rua Laura Padilha de Souza",situacao:"QUITADO",proprietario:"ADAUTO ANDRADE DOS SANTOS",cpf:"153.592.066-16",inscricao:"01.01.087.0675.001"},
  {quadra:14,lote:1,area:297.27,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"HENRIQUE ANDRADE DA SILVA LEITE",cpf:"154.231206-08",inscricao:"01.01.087.0687.001"},
  {quadra:14,lote:2,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"MARIA JOSÉ FERREIRA TOMAZ",cpf:"057874336-10",inscricao:"01.01.087.0699.001"},
  {quadra:14,lote:3,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0711.001"},
  {quadra:14,lote:4,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0723.001"},
  {quadra:14,lote:5,area:313.5,rua:"Rua Laura Padilha de Souza",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:"01.01.087.0735.001"},
  {quadra:14,lote:6,area:319.28,rua:"Rua Laura Padilha de Souza",situacao:"VENDIDO",proprietario:"DAVID DE SOUZA",cpf:"138.233.656-06",inscricao:"01.01.087.0747.001"},
  {quadra:15,lote:3,area:300.0,rua:"Rua Sebastião Madeira",situacao:"QUITADO",proprietario:"EDUARDO PEREIRA DA SILVA",cpf:"148.674.106-16",inscricao:"01.01.087.0207.001"},
  {quadra:12,lote:1,area:336.46,rua:"",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:""},
  {quadra:15,lote:1,area:336.46,rua:"",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:""},

  {quadra:7,lote:1,area:351.24,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:2,area:357.85,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:3,area:368.95,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:4,area:372.25,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:5,area:377.4,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:6,area:375.5,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:7,area:380.0,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:8,area:370.0,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:9,area:365.0,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:10,area:360.0,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:7,lote:11,area:310.52,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:8,lote:1,area:305.79,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:8,lote:2,area:327.69,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:8,lote:3,area:339.6,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:8,lote:4,area:386.5,rua:"Rua Vista Alegre",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:1,area:360.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:2,area:360.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:3,area:360.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:4,area:358.18,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:5,area:362.38,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:6,area:360.94,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:7,area:326.24,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:8,area:370.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:9,area:443.88,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:10,area:382.46,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:11,area:360.86,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:12,area:367.86,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:13,area:383.22,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:14,area:364.25,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:15,area:362.45,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:9,lote:16,area:334.41,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:1,area:305.79,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:2,area:360.0,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:3,area:340.0,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:4,area:300.0,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:5,area:380.55,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:6,area:375.02,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:7,area:326.24,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:8,area:303.82,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:9,area:353.82,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:10,area:268.61,rua:"Rua Hilda Flora Menezes",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:11,area:344.14,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:12,area:367.86,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:14,area:364.25,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:10,lote:15,area:362.45,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:12,lote:2,area:360.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:12,lote:3,area:339.6,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:12,lote:4,area:300.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:12,lote:5,area:300.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:12,lote:6,area:300.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:12,lote:7,area:300.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:12,lote:9,area:292.19,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:12,lote:10,area:300.0,rua:"Rua Sebastião Madeira",situacao:"VENDIDO",proprietario:"",cpf:"",inscricao:""},
  {quadra:15,lote:2,area:320.70,rua:"Rua Sebastião Madeira",situacao:"IMOB.",proprietario:"",cpf:"",inscricao:""},
];

// Perimeter UTM coordinates from Memorial Descritivo (normalized to 0-1000 SVG space)
// Original UTM: N 7918356-7918857, E 750551-751169 (SIRGAS2000, Zone 23S)
export const perimeterCoords: [number, number][] = [
  [886.2, 108.3],
  [902.9, 120.6],
  [933.9, 152.2],
  [943.5, 161.8],
  [970.0, 190.8],
  [954.6, 205.8],
  [926.2, 232.9],
  [911.6, 244.2],
  [897.3, 257.5],
  [883.5, 270.8],
  [855.8, 297.4],
  [842.1, 310.4],
  [827.9, 323.3],
  [855.6, 343.1],
  [867.4, 362.8],
  [873.2, 365.0],
  [883.7, 368.6],
  [893.3, 371.6],
  [907.5, 377.4],
  [912.5, 379.4],
  [874.6, 407.5],
  [831.9, 439.1],
  [818.8, 448.0],
  [687.1, 538.3],
  [717.8, 589.8],
  [632.9, 640.9],
  [546.2, 693.1],
  [412.3, 749.8],
  [77.6, 891.7],
  [72.0, 896.7],
  [30.0, 849.7],
  [-3.0, 815.0],
  [40.5, 776.8],
  [41.1, 741.0],
  [63.2, 719.9],
  [65.2, 697.0],
  [57.0, 684.5],
  [57.2, 678.5],
  [81.7, 619.5],
  [72.5, 617.5],
  [76.7, 589.1],
  [65.5, 590.3],
  [53.4, 582.8],
  [45.1, 568.4],
  [39.4, 539.8],
  [41.6, 515.7],
  [41.5, 499.5],
  [38.2, 468.8],
  [58.1, 452.9],
  [84.5, 445.1],
  [122.3, 452.1],
  [182.9, 427.3],
  [252.6, 409.5],
  [325.2, 393.7],
  [347.1, 379.7],
  [351.6, 366.3],
  [353.3, 355.9],
  [360.6, 348.5],
  [370.6, 345.3],
  [399.6, 337.6],
  [420.3, 329.7],
  [439.6, 317.1],
  [462.6, 296.8],
  [477.3, 280.9],
  [498.7, 304.9],
  [511.9, 309.0],
  [530.3, 330.0],
  [536.2, 323.9],
  [551.1, 314.5],
  [573.0, 310.8],
  [583.8, 308.1],
  [594.3, 307.4],
  [601.2, 306.1],
  [604.7, 304.9],
  [612.6, 300.6],
  [627.9, 287.9],
  [638.7, 278.0],
  [642.6, 275.5],
  [650.4, 269.3],
  [656.2, 264.0],
  [660.7, 259.8],
  [672.9, 250.3],
  [671.9, 249.2],
  [680.7, 241.2],
  [676.2, 236.2],
  [698.7, 217.1],
  [709.8, 210.1],
  [747.3, 186.9],
  [786.1, 164.0],
  [799.1, 157.0],
  [835.9, 136.0],
  [846.5, 130.1],
  [865.8, 119.5],
]

// Real expense data imported from expenseData.ts (parsed from monthly spreadsheets Feb 2025 - Feb 2026)
import { REAL_EXPENSES } from './expenseData';
const defaultExpenses: Expense[] = REAL_EXPENSES as Expense[];

export function getSales(): Sale[] { return salesData; }
export function getLots(): Lot[] { return lotsData; }
export function getActiveSales(): Sale[] { return salesData.filter(s => s.situacao !== 'CANCELADO'); }

export function getExpensesFromStorage(): Expense[] {
  if (typeof window === 'undefined') return defaultExpenses;
  const stored = localStorage.getItem('erp_expenses_v2');
  return stored ? JSON.parse(stored) : defaultExpenses;
}

export function saveExpensesToStorage(expenses: Expense[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_expenses_v2', JSON.stringify(expenses));
  }
}

// Payment tracking via localStorage
function getInstallmentKey(saleId: number, parcela: number): string {
  return `${saleId}-${parcela}`;
}

export function getPaidInstallments(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const stored = localStorage.getItem('erp_paid_installments_v3');
  if (stored) return new Set(JSON.parse(stored));
  // Pre-populate: mark only installments with due date before today as paid
  const today = new Date();
  const allKeys = new Set<string>();
  const active = getActiveSales();
  for (const sale of active) {
    if (sale.numParcelas <= 0 || !sale.dataPrimeiraParcela || sale.valorParcela <= 0) continue;
    const firstDate = new Date(sale.dataPrimeiraParcela + 'T00:00:00');
    for (let p = 0; p < sale.numParcelas; p++) {
      const dueDate = addMonths(firstDate, p);
      if (dueDate < today) {
        allKeys.add(`${sale.id}-${p + 1}`);
      }
    }
  }
  savePaidInstallments(allKeys);
  return allKeys;
}

export function savePaidInstallments(paid: Set<string>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_paid_installments_v3', JSON.stringify(Array.from(paid)));
  }
}

export function generateInstallments(paidSet?: Set<string>): Installment[] {
  const today = new Date();
  const installments: Installment[] = [];
  const activeSales = getActiveSales();
  const paid = paidSet || getPaidInstallments();

  for (const sale of activeSales) {
    if (sale.numParcelas <= 0 || !sale.dataPrimeiraParcela || sale.valorParcela <= 0) continue;
    const firstDate = new Date(sale.dataPrimeiraParcela + 'T00:00:00');

    for (let p = 0; p < sale.numParcelas; p++) {
      const dueDate = addMonths(firstDate, p);
      const diasAtraso = differenceInDays(today, dueDate);
      const key = getInstallmentKey(sale.id, p + 1);
      const isPaid = paid.has(key);

      let status: Installment['status'];
      if (isPaid) {
        status = 'PAGO';
      } else if (diasAtraso > 0) {
        status = 'VENCIDO';
      } else if (isSameMonth(dueDate, today) && dueDate.getFullYear() === today.getFullYear()) {
        status = 'VENCE ESTE MÊS';
      } else if (diasAtraso >= -30) {
        status = 'A VENCER';
      } else {
        status = 'PENDENTE';
      }

      installments.push({
        saleId: sale.id,
        cliente: sale.nome,
        quadra: sale.quadra,
        lote: sale.lote,
        parcela: p + 1,
        totalParcelas: sale.numParcelas,
        dataVencimento: dueDate,
        valor: sale.valorParcela,
        status,
        diasAtraso: isPaid ? 0 : Math.max(0, diasAtraso),
      });
    }
  }

  return installments;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(date: string | Date | null): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return d.toLocaleDateString('pt-BR');
}
