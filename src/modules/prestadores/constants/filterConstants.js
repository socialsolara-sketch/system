// Arquivo: src/modules/prestadores/constants/filterConstants.js
// Descrição: Constantes para filtros do módulo de prestadores
// Baseado nas tabelas reais do banco de dados: especialidades, planos

// Cidades por estado
export const CIDADES_LIST = [
  // São Paulo (SP)
  { code: 'sao_paulo', label: 'SÃO PAULO', estado: 'SP' },
  { code: 'campinas', label: 'CAMPINAS', estado: 'SP' },
  { code: 'santos', label: 'SANTOS', estado: 'SP' },
  { code: 'sorocaba', label: 'SOROCABA', estado: 'SP' },
  { code: 'ribeirao_preto', label: 'RIBEIRÃO PRETO', estado: 'SP' },
  { code: 'sao_jose_dos_campos', label: 'SÃO JOSÉ DOS CAMPOS', estado: 'SP' },
  { code: 'sao_jose_do_rio_preto', label: 'SÃO JOSÉ DO RIO PRETO', estado: 'SP' },
  { code: 'osasco', label: 'OSASCO', estado: 'SP' },
  { code: 'guarulhos', label: 'GUARULHOS', estado: 'SP' },
  { code: 'sao_bernardo_do_campo', label: 'SÃO BERNARDO DO CAMPO', estado: 'SP' },
  { code: 'santo_andre', label: 'SANTO ANDRÉ', estado: 'SP' },
  { code: 'maua', label: 'MAUÁ', estado: 'SP' },
  { code: 'diadema', label: 'DIADEMA', estado: 'SP' },
  { code: 'carapicuiba', label: 'CARAPICUÍBA', estado: 'SP' },
  { code: 'mogi_das_cruzes', label: 'MOGI DAS CRUZES', estado: 'SP' },
  { code: 'piracicaba', label: 'PIRACICABA', estado: 'SP' },
  { code: 'bau', label: 'BAURU', estado: 'SP' },
  { code: 'jundiai', label: 'JUNDIAÍ', estado: 'SP' },
  { code: 'marilia', label: 'MARÍLIA', estado: 'SP' },
  { code: 'presidente_prudente', label: 'PRESIDENTE PRUDENTE', estado: 'SP' },
  
  // Mato Grosso do Sul (MS)
  { code: 'campo_grande', label: 'CAMPO GRANDE', estado: 'MS' },
  { code: 'dourados', label: 'DOURADOS', estado: 'MS' },
  { code: 'três_lagoas', label: 'TRÊS LAGOAS', estado: 'MS' },
  { code: 'corumba', label: 'CORUMBÁ', estado: 'MS' },
  { code: 'ponta_pora', label: 'PONTA PORÃ', estado: 'MS' },
  { code: 'aquidauana', label: 'AQUIDAUANA', estado: 'MS' },
  { code: 'navarai', label: 'NAVARAÍ', estado: 'MS' },
  { code: 'miranda', label: 'MIRANDA', estado: 'MS' },
  { code: 'anaurilandia', label: 'ANAURILÂNDIA', estado: 'MS' },
  { code: 'sidrolandia', label: 'SIDROLÂNDIA', estado: 'MS' }
]

// Especialidades serão carregadas dinamicamente do banco de dados
// Esta é uma lista de fallback caso o banco não tenha dados
export const ESPECIALIDADES_LIST = [
  { code: 'acupuntura', label: 'ACUPUNTURA' },
  { code: 'alergia', label: 'ALERGIA E IMUNOLOGIA' },
  { code: 'analises', label: 'ANÁLISES CLÍNICAS' },
  { code: 'cardiologia', label: 'CARDIOLOGIA' },
  { code: 'clinica_medica', label: 'CLÍNICA MÉDICA' },
  { code: 'dermatologia', label: 'DERMATOLOGIA' },
  { code: 'ginecologia', label: 'GINECOLOGIA' },
  { code: 'pediatria', label: 'PEDIATRIA' },
  { code: 'ortopedia', label: 'ORTOPEDIA' },
  { code: 'oftalmologia', label: 'OFTALMOLOGIA' }
]

// Planos serão carregados dinamicamente do banco de dados
// Esta é uma lista de fallback caso o banco não tenha dados
export const PLANOS_LIST = [
  { code: 'exclusivo_adesao', label: 'EXCLUSIVO ADESÃO' },
  { code: 'empresarial', label: 'EMPRESARIAL' },
  { code: 'individual', label: 'INDIVIDUAL' },
  { code: 'coletivo', label: 'COLETIVO' }
]

// Produtos/Segmentos
export const PRODUTOS_LIST = [
  { id: 'ambulatorial', label: 'AMBULATORIAL' },
  { id: 'hospitalar', label: 'HOSPITALAR' },
  { id: 'odonto', label: 'ODONTOLÓGICO' },
  { id: 'completo', label: 'COMPLETO' }
]