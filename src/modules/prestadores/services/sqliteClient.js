// Arquivo: src/modules/prestadores/services/sqliteClient.js
// Descrição: Cliente SQLite local (sql.js / WebAssembly) para gerenciamento do banco de dados na pasta data/
// Suporta execução de consultas parametrizadas, migrações de schema e persistência do estado no navegador.

import initSqlJs from 'sql.js'
import { generateUUIDv7 } from '@shared/utils/uuidv7'

const SQLITE_STORAGE_KEY = 'prestadores_sqlite_db_bin_v1'
let dbInstance = null
let initPromise = null

// Schema DDL para Prestadores e Acordos TUSS
const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS prestadores (
  id TEXT PRIMARY KEY,
  id_pessoa TEXT,
  codigo_operadora_prestador TEXT,
  nome TEXT,
  nome_razao_social TEXT,
  nome_fantasia TEXT,
  unidade TEXT,
  tipo_pessoa TEXT,
  cpf_cnpj TEXT,
  crm TEXT,
  numero_conselho TEXT,
  conselho_profissional TEXT,
  uf_conselho TEXT,
  cbos TEXT,
  especialidade TEXT,
  estrutura TEXT,
  tipo_prestador TEXT,
  atendimento TEXT,
  modalidade_atendimento TEXT,
  idade TEXT,
  atendimento_idade TEXT,
  faixa_etaria TEXT,
  credenciado TEXT,
  status_credenciamento TEXT,
  status TEXT,
  contrato_ativo TEXT,
  contrato_desativado TEXT,
  data_credenciamento TEXT,
  data_descredenciamento TEXT,
  plano TEXT,
  planos TEXT,
  produto TEXT,
  rede_produto TEXT,
  cep TEXT,
  estado TEXT,
  uf TEXT,
  municipio TEXT,
  cidade TEXT,
  endereco TEXT,
  logradouro TEXT,
  numero_endereco TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  telefone TEXT,
  email TEXT,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS prestadores_acordado (
  id TEXT PRIMARY KEY,
  prestador_id TEXT,
  codigo_tuss TEXT,
  nome TEXT,
  descricao TEXT,
  grupo TEXT,
  rol_ans INTEGER,
  valor_referencia REAL,
  valor_acordado REAL,
  fator_ch REAL,
  filme_porte REAL,
  exige_autorizacao INTEGER,
  acordo_data_inicio TEXT,
  acordo_data_fim TEXT,
  vigencia_inicio TEXT,
  vigencia_fim TEXT,
  status TEXT,
  regra_coparticipacao TEXT,
  observacoes_acordo TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (prestador_id) REFERENCES prestadores(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prestadores_nome ON prestadores(nome);
CREATE INDEX IF NOT EXISTS idx_prestadores_crm ON prestadores(crm);
CREATE INDEX IF NOT EXISTS idx_prestadores_esp ON prestadores(especialidade);
CREATE INDEX IF NOT EXISTS idx_acordos_prestador ON prestadores_acordado(prestador_id);
CREATE INDEX IF NOT EXISTS idx_acordos_tuss ON prestadores_acordado(codigo_tuss);
`

// Dados iniciais padrão (Seed) caso o banco esteja vazio
const INITIAL_PRESTADORES = [
  {
    id: '01923450-0001-7000-8000-000000000001',
    id_pessoa: '01923450-0001-7000-8000-000000000001',
    codigo_operadora_prestador: 'RDA-00101',
    nome: 'DR. CARLOS EDUARDO MENDES',
    nome_razao_social: 'DR. CARLOS EDUARDO MENDES',
    nome_fantasia: 'CONSULTÓRIO CARDIOLÓGICO MENDES',
    unidade: 'UNIDADE PAULISTA',
    tipo_pessoa: 'FISICA',
    cpf_cnpj: '123.456.789-00',
    crm: '142857',
    numero_conselho: '142857',
    conselho_profissional: 'CRM',
    uf_conselho: 'SP',
    cbos: '225120 - MÉDICO CARDIOLOGISTA',
    especialidade: 'CARDIOLOGIA',
    estrutura: 'CONSULTÓRIO',
    tipo_prestador: 'MED',
    atendimento: 'Presencial e Telemedicina',
    modalidade_atendimento: 'Presencial e Telemedicina',
    idade: 'Adulto e Idoso',
    atendimento_idade: 'Adulto e Idoso',
    faixa_etaria: 'Adulto e Idoso',
    credenciado: 'Sim',
    status_credenciamento: 'ATIVO',
    status: 'ATIVO',
    contrato_ativo: 'Sim',
    contrato_desativado: 'Não',
    data_credenciamento: '2023-01-15',
    data_descredenciamento: null,
    plano: 'PLANO PREMIUM I SP INDIVIDUAL BRONZE',
    planos: 'PLANO PREMIUM I SP INDIVIDUAL BRONZE, SMART',
    produto: 'Premium São Paulo',
    rede_produto: 'Premium São Paulo',
    cep: '01310-100',
    estado: 'SP',
    uf: 'SP',
    municipio: 'SÃO PAULO',
    cidade: 'SÃO PAULO',
    endereco: 'AV. PAULISTA',
    logradouro: 'AV. PAULISTA',
    numero_endereco: '1000',
    numero: '1000',
    complemento: 'CJ 142',
    bairro: 'BELA VISTA',
    telefone: '(11) 3288-9000',
    email: 'carlos.mendes@cardiopaulista.com.br',
    created_at: '2023-01-15T08:00:00.000Z',
    updated_at: '2025-01-10T10:30:00.000Z'
  },
  {
    id: '01923450-0002-7000-8000-000000000002',
    id_pessoa: '01923450-0002-7000-8000-000000000002',
    codigo_operadora_prestador: 'RDA-00204',
    nome: 'DRA. BEATRIZ HELENA ALCANTARA',
    nome_razao_social: 'DRA. BEATRIZ HELENA ALCANTARA',
    nome_fantasia: 'CLÍNICA DE PEDIATRIA E VACINAS',
    unidade: 'UNIDADE JARDINS',
    tipo_pessoa: 'FISICA',
    cpf_cnpj: '987.654.321-11',
    crm: '189342',
    numero_conselho: '189342',
    conselho_profissional: 'CRM',
    uf_conselho: 'SP',
    cbos: '225124 - MÉDICO PEDIATRA',
    especialidade: 'PEDIATRIA',
    estrutura: 'CLINICA',
    tipo_prestador: 'CLI',
    atendimento: 'Presencial',
    modalidade_atendimento: 'Presencial',
    idade: 'Pediátrico (0 a 14 anos)',
    atendimento_idade: 'Pediátrico (0 a 14 anos)',
    faixa_etaria: 'Pediátrico (0 a 14 anos)',
    credenciado: 'Sim',
    status_credenciamento: 'ATIVO',
    status: 'ATIVO',
    contrato_ativo: 'Sim',
    contrato_desativado: 'Não',
    data_credenciamento: '2022-06-10',
    data_descredenciamento: null,
    plano: 'PREMIUM I SP INDIVIDUAL OURO',
    planos: 'PREMIUM I SP INDIVIDUAL OURO, SMART EMPRESARIAL',
    produto: 'Premium São Paulo',
    rede_produto: 'Premium São Paulo',
    cep: '01420-001',
    estado: 'SP',
    uf: 'SP',
    municipio: 'SÃO PAULO',
    cidade: 'SÃO PAULO',
    endereco: 'RUA OSCAR FREIRE',
    logradouro: 'RUA OSCAR FREIRE',
    numero_endereco: '450',
    numero: '450',
    complemento: 'SALA 3',
    bairro: 'CERQUEIRA CÉSAR',
    telefone: '(11) 3081-4500',
    email: 'contato@beatrizpediatria.med.br',
    created_at: '2022-06-10T09:00:00.000Z',
    updated_at: '2025-01-12T14:00:00.000Z'
  },
  {
    id: '01923450-0003-7000-8000-000000000003',
    id_pessoa: '01923450-0003-7000-8000-000000000003',
    codigo_operadora_prestador: 'RDA-00350',
    nome: 'LABORATÓRIO CENTRAL DIAGNÓSTICOS LTDA',
    nome_razao_social: 'LABORATÓRIO CENTRAL DIAGNÓSTICOS LTDA',
    nome_fantasia: 'LABORATÓRIO CENTRAL',
    unidade: 'MATRIZ CENTRO MÉDICO',
    tipo_pessoa: 'JURIDICA',
    cpf_cnpj: '12.345.678/0001-90',
    crm: 'CRBM-45120',
    numero_conselho: 'CRBM-45120',
    conselho_profissional: 'CRBM',
    uf_conselho: 'SP',
    cbos: '221105 - BIÓLOGO EM PATOLOGIA',
    especialidade: 'PATOLOGIA CLÍNICA / MEDICINA LABORATORIAL',
    estrutura: 'LABORATORIO',
    tipo_prestador: 'LAB',
    atendimento: 'Presencial e Coleta Domiciliar',
    modalidade_atendimento: 'Presencial e Coleta Domiciliar',
    idade: 'Todas as idades',
    atendimento_idade: 'Todas as idades',
    faixa_etaria: 'Todas as idades',
    credenciado: 'Sim',
    status_credenciamento: 'ATIVO',
    status: 'ATIVO',
    contrato_ativo: 'Sim',
    contrato_desativado: 'Não',
    data_credenciamento: '2021-03-01',
    data_descredenciamento: null,
    plano: 'EXCLUSIVO EMPRESARIAL',
    planos: 'TODOS OS PLANOS',
    produto: 'Todos os Produtos',
    rede_produto: 'Premium São Paulo',
    cep: '04030-000',
    estado: 'SP',
    uf: 'SP',
    municipio: 'SÃO PAULO',
    cidade: 'SÃO PAULO',
    endereco: 'RUA DOMINGOS DE MORAIS',
    logradouro: 'RUA DOMINGOS DE MORAIS',
    numero_endereco: '1800',
    numero: '1800',
    complemento: 'TÉRREO',
    bairro: 'VILA MARIANA',
    telefone: '(11) 5576-1000',
    email: 'credenciamento@labcentral.com.br',
    created_at: '2021-03-01T08:00:00.000Z',
    updated_at: '2025-01-05T11:00:00.000Z'
  }
]

const INITIAL_ACORDOS = [
  {
    id: '01923450-0101-7000-8000-000000000101',
    prestador_id: '01923450-0001-7000-8000-000000000001',
    codigo_tuss: '10101012',
    nome: 'Consulta em consultório (no horário normal ou preestabelecido)',
    descricao: 'Consulta em consultório (no horário normal ou preestabelecido)',
    grupo: 'Consultas Médicas',
    rol_ans: 1,
    valor_referencia: 150.00,
    valor_acordado: 160.00,
    fator_ch: 40,
    filme_porte: 0,
    exige_autorizacao: 0,
    acordo_data_inicio: '2025-01-01',
    acordo_data_fim: '2026-12-31',
    vigencia_inicio: '2025-01-01',
    vigencia_fim: '2026-12-31',
    status: 'ATIVO',
    regra_coparticipacao: 'Padrão da Operadora (20%)',
    observacoes_acordo: 'Pactuação com valor diferenciado para atendimento cardiológico.',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '01923450-0102-7000-8000-000000000102',
    prestador_id: '01923450-0001-7000-8000-000000000001',
    codigo_tuss: '40101010',
    nome: 'Eletrocardiograma convencional (ECG) de 12 derivações com laudo',
    descricao: 'Eletrocardiograma convencional (ECG) de 12 derivações com laudo',
    grupo: 'Métodos Diagnósticos',
    rol_ans: 1,
    valor_referencia: 55.00,
    valor_acordado: 60.00,
    fator_ch: 15,
    filme_porte: 0,
    exige_autorizacao: 0,
    acordo_data_inicio: '2025-01-01',
    acordo_data_fim: '2026-12-31',
    vigencia_inicio: '2025-01-01',
    vigencia_fim: '2026-12-31',
    status: 'ATIVO',
    regra_coparticipacao: 'Isento',
    observacoes_acordo: 'Procedimento ambulatorial realizado no consultório.',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '01923450-0103-7000-8000-000000000103',
    prestador_id: '01923450-0001-7000-8000-000000000001',
    codigo_tuss: '40103137',
    nome: 'Teste ergométrico convencional em esteira com laudo',
    descricao: 'Teste ergométrico convencional em esteira com laudo',
    grupo: 'Cardiologia Diagnóstica',
    rol_ans: 1,
    valor_referencia: 185.00,
    valor_acordado: 195.00,
    fator_ch: 60,
    filme_porte: 0,
    exige_autorizacao: 0,
    acordo_data_inicio: '2025-01-01',
    acordo_data_fim: '2026-12-31',
    vigencia_inicio: '2025-01-01',
    vigencia_fim: '2026-12-31',
    status: 'ATIVO',
    regra_coparticipacao: 'Padrão (20%)',
    observacoes_acordo: 'Equipamento digital calibrado.',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '01923450-0201-7000-8000-000000000201',
    prestador_id: '01923450-0002-7000-8000-000000000002',
    codigo_tuss: '10101012',
    nome: 'Consulta em consultório (no horário normal ou preestabelecido)',
    descricao: 'Consulta em consultório (no horário normal ou preestabelecido)',
    grupo: 'Consultas Médicas',
    rol_ans: 1,
    valor_referencia: 150.00,
    valor_acordado: 155.00,
    fator_ch: 40,
    filme_porte: 0,
    exige_autorizacao: 0,
    acordo_data_inicio: '2025-01-01',
    acordo_data_fim: '2026-12-31',
    vigencia_inicio: '2025-01-01',
    vigencia_fim: '2026-12-31',
    status: 'ATIVO',
    regra_coparticipacao: 'Padrão (20%)',
    observacoes_acordo: 'Consulta pediátrica puericultura inclusa.',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '01923450-0301-7000-8000-000000000301',
    prestador_id: '01923450-0003-7000-8000-000000000003',
    codigo_tuss: '40304361',
    nome: 'Hemograma completo com contagem de plaquetas ou frações',
    descricao: 'Hemograma completo com contagem de plaquetas ou frações',
    grupo: 'Patologia Clínica / Hematologia',
    rol_ans: 1,
    valor_referencia: 28.00,
    valor_acordado: 28.00,
    fator_ch: 8,
    filme_porte: 0,
    exige_autorizacao: 0,
    acordo_data_inicio: '2025-01-01',
    acordo_data_fim: '2026-12-31',
    vigencia_inicio: '2025-01-01',
    vigencia_fim: '2026-12-31',
    status: 'ATIVO',
    regra_coparticipacao: 'Isento',
    observacoes_acordo: 'Análise automatizada com revisão microscópica.',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '01923450-0302-7000-8000-000000000302',
    prestador_id: '01923450-0003-7000-8000-000000000003',
    codigo_tuss: '40301630',
    nome: 'Colesterol total e frações (HDL, LDL, VLDL) e Triglicerídeos',
    descricao: 'Colesterol total e frações (HDL, LDL, VLDL) e Triglicerídeos',
    grupo: 'Patologia Clínica / Bioquímica',
    rol_ans: 1,
    valor_referencia: 32.00,
    valor_acordado: 32.00,
    fator_ch: 10,
    filme_porte: 0,
    exige_autorizacao: 0,
    acordo_data_inicio: '2025-01-01',
    acordo_data_fim: '2026-12-31',
    vigencia_inicio: '2025-01-01',
    vigencia_fim: '2026-12-31',
    status: 'ATIVO',
    regra_coparticipacao: 'Isento',
    observacoes_acordo: 'Perfil lipídico completo.',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  }
]

/**
 * Salva a base SQLite serializada em formato binário no localStorage
 */
function persistDatabase(db) {
  try {
    const data = db.export()
    // Converte Uint8Array para base64 para armazenamento confiável
    let binary = ''
    const len = data.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(data[i])
    }
    const base64 = btoa(binary)
    localStorage.setItem(SQLITE_STORAGE_KEY, base64)
  } catch (err) {
    console.warn('[SQLiteClient] Aviso ao persistir banco no localStorage:', err)
  }
}

/**
 * Tenta carregar binário salvo previamente ou do arquivo de data
 */
async function loadSavedDatabase(SQL) {
  // 1. Tenta recuperar da persistência local recente
  try {
    const saved = localStorage.getItem(SQLITE_STORAGE_KEY)
    if (saved) {
      const binary = atob(saved)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }
      return new SQL.Database(bytes)
    }
  } catch (e) {
    console.warn('[SQLiteClient] Falha ao ler cache local de binário SQLite:', e)
  }

  // 2. Tenta recuperar migration de prestadores legados se houver
  try {
    const legacyPrestadoresRaw = localStorage.getItem('prestadores_database_operadora_v1')
    const legacyAcordosRaw = localStorage.getItem('prestadores_acordos_tuss_v1')
    if (legacyPrestadoresRaw) {
      const legacyList = JSON.parse(legacyPrestadoresRaw)
      if (Array.isArray(legacyList) && legacyList.length > 0) {
        const db = new SQL.Database()
        db.run(SCHEMA_DDL)
        // Insere legados
        insertPrestadoresBatch(db, legacyList)
        if (legacyAcordosRaw) {
          const acordosList = JSON.parse(legacyAcordosRaw)
          if (Array.isArray(acordosList)) {
            insertAcordosBatch(db, acordosList)
          }
        }
        persistDatabase(db)
        return db
      }
    }
  } catch (e) {
    console.warn('[SQLiteClient] Falha na migração de legados:', e)
  }

  // 3. Cria novo banco e popula com schema e seeds padrão
  const db = new SQL.Database()
  db.run(SCHEMA_DDL)
  insertPrestadoresBatch(db, INITIAL_PRESTADORES)
  insertAcordosBatch(db, INITIAL_ACORDOS)
  persistDatabase(db)
  return db
}

function insertPrestadoresBatch(db, list) {
  const insertSql = `
    INSERT OR REPLACE INTO prestadores (
      id, id_pessoa, codigo_operadora_prestador, nome, nome_razao_social, nome_fantasia,
      unidade, tipo_pessoa, cpf_cnpj, crm, numero_conselho, conselho_profissional,
      uf_conselho, cbos, especialidade, estrutura, tipo_prestador, atendimento,
      modalidade_atendimento, idade, atendimento_idade, faixa_etaria, credenciado,
      status_credenciamento, status, contrato_ativo, contrato_desativado, data_credenciamento,
      data_descredenciamento, plano, planos, produto, rede_produto, cep, estado, uf,
      municipio, cidade, endereco, logradouro, numero_endereco, numero, complemento,
      bairro, telefone, email, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    );
  `
  for (const item of list) {
    const id = item.id || generateUUIDv7()
    const idPessoa = item.id_pessoa || id
    const nome = item.nome_razao_social || item.nome || 'PRESTADOR'
    const params = [
      id,
      idPessoa,
      item.codigo_operadora_prestador || `RDA-${id.slice(0, 5)}`,
      nome,
      nome,
      item.nome_fantasia || item.unidade || nome,
      item.unidade || item.nome_fantasia || 'UNIDADE PRINCIPAL',
      item.tipo_pessoa || (item.cpf_cnpj?.length > 14 ? 'JURIDICA' : 'FISICA'),
      item.cpf_cnpj || '',
      item.crm || item.numero_conselho || '',
      item.numero_conselho || item.crm || '',
      item.conselho_profissional || 'CRM',
      item.uf_conselho || item.estado || item.uf || 'SP',
      item.cbos || item.especialidade || 'CLÍNICA MÉDICA',
      item.especialidade || item.cbos || 'CLÍNICA MÉDICA',
      item.estrutura || item.tipo_prestador || 'CONSULTÓRIO',
      item.tipo_prestador || item.estrutura || 'MED',
      item.atendimento || item.modalidade_atendimento || 'Presencial',
      item.modalidade_atendimento || item.atendimento || 'Presencial',
      item.idade || item.faixa_etaria || 'Todas as idades',
      item.atendimento_idade || item.idade || 'Todas as idades',
      item.faixa_etaria || item.idade || 'Todas as idades',
      item.credenciado || 'Sim',
      item.status_credenciamento || item.status || 'ATIVO',
      item.status || item.status_credenciamento || 'ATIVO',
      item.contrato_ativo || 'Sim',
      item.contrato_desativado || 'Não',
      item.data_credenciamento || new Date().toISOString().slice(0, 10),
      item.data_descredenciamento || null,
      item.plano || 'PLANO BASICO',
      item.planos || item.plano || 'PLANO BASICO',
      item.produto || 'Todos os Produtos',
      item.rede_produto || item.produto || 'Todos os Produtos',
      item.cep || '01000-000',
      (item.estado || item.uf || 'SP').toUpperCase(),
      (item.uf || item.estado || 'SP').toUpperCase(),
      item.municipio || item.cidade || 'SÃO PAULO',
      item.cidade || item.municipio || 'SÃO PAULO',
      item.endereco || item.logradouro || '',
      item.logradouro || item.endereco || '',
      item.numero_endereco || item.numero || 'S/N',
      item.numero || item.numero_endereco || 'S/N',
      item.complemento || '',
      item.bairro || '',
      item.telefone || '',
      item.email || '',
      item.created_at || new Date().toISOString(),
      item.updated_at || new Date().toISOString()
    ]
    try {
      db.run(insertSql, params)
    } catch (e) {
      console.error('[SQLiteClient] Erro ao inserir prestador seed:', e)
    }
  }
}

function insertAcordosBatch(db, list) {
  const insertSql = `
    INSERT OR REPLACE INTO prestadores_acordado (
      id, prestador_id, codigo_tuss, nome, descricao, grupo, rol_ans,
      valor_referencia, valor_acordado, fator_ch, filme_porte,
      exige_autorizacao, acordo_data_inicio, acordo_data_fim,
      vigencia_inicio, vigencia_fim, status, regra_coparticipacao,
      observacoes_acordo, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    );
  `
  for (const item of list) {
    const id = item.id || generateUUIDv7()
    const prestadorId = item.prestador_id || item.prestador
    const params = [
      id,
      prestadorId,
      item.codigo_tuss || '',
      item.nome || item.descricao || '',
      item.descricao || item.nome || '',
      item.grupo || 'Consultas Médicas',
      item.rol_ans ? 1 : 0,
      parseFloat(item.valor_referencia) || 0,
      parseFloat(item.valor_acordado ?? item.valor_referencia) || 0,
      parseFloat(item.fator_ch) || 0,
      parseFloat(item.filme_porte) || 0,
      item.exige_autorizacao ? 1 : 0,
      item.acordo_data_inicio || item.vigencia_inicio || new Date().toISOString().slice(0, 10),
      item.acordo_data_fim || item.vigencia_fim || null,
      item.vigencia_inicio || item.acordo_data_inicio || new Date().toISOString().slice(0, 10),
      item.vigencia_fim || item.acordo_data_fim || null,
      item.status || 'ATIVO',
      item.regra_coparticipacao || 'Padrão da Operadora (20%)',
      item.observacoes_acordo || '',
      item.created_at || new Date().toISOString(),
      item.updated_at || new Date().toISOString()
    ]
    try {
      db.run(insertSql, params)
    } catch (e) {
      console.error('[SQLiteClient] Erro ao inserir acordo seed:', e)
    }
  }
}

/**
 * Inicializa a instância do SQLite Database
 */
export async function getSqliteDb() {
  if (dbInstance) return dbInstance

  if (!initPromise) {
    initPromise = (async () => {
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      })
      const db = await loadSavedDatabase(SQL)
      dbInstance = db
      return dbInstance
    })()
  }

  return initPromise
}

/**
 * Executa uma consulta SQL parametrizada e retorna um array de objetos tipados
 */
export async function query(sqlText, params = []) {
  const db = await getSqliteDb()
  const stmt = db.prepare(sqlText)
  if (params && params.length > 0) {
    stmt.bind(params)
  }
  const results = []
  while (stmt.step()) {
    results.push(stmt.getAsObject())
  }
  stmt.free()
  return results
}

/**
 * Executa uma consulta SQL que retorna apenas um registro ou null
 */
export async function queryOne(sqlText, params = []) {
  const list = await query(sqlText, params)
  return list.length > 0 ? list[0] : null
}

/**
 * Executa uma instrução DML (INSERT, UPDATE, DELETE) e persiste o banco automaticamente
 */
export async function execute(sqlText, params = []) {
  const db = await getSqliteDb()
  db.run(sqlText, params)
  persistDatabase(db)
  return true
}

/**
 * Executa um bloco de operações dentro de uma transação SQLite segura
 */
export async function transaction(callback) {
  const db = await getSqliteDb()
  db.run('BEGIN TRANSACTION;')
  try {
    await callback(db)
    db.run('COMMIT;')
    persistDatabase(db)
  } catch (err) {
    db.run('ROLLBACK;')
    throw err
  }
}

/**
 * Exporta os bytes binários do banco de dados SQLite
 */
export async function exportDatabaseBinary() {
  const db = await getSqliteDb()
  return db.export()
}
