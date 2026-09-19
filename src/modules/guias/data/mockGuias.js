// Arquivo: src/modules/guias/data/mockGuias.js
// Descrição: Base de dados simulada para o módulo de Guias com mapeamento de campos Protheus/TISS.

const mockGuias = [
  {
    id: 1,
    // 1. Identificação
    num_guia: '10002568',
    guia_prestador: 'GP-2024-001',
    senha_autorizacao: 'SNS-2024-X9',
    tipo_guia: '2-SPSADT',
    carater_atendimento: 'E-Eletivo',
    data_solicitacao: '2024-09-19T10:30:00',
    validade_guia: '2024-10-19',
    executada: 'SIM',
    
    // 2. Beneficiário
    carteirinha: '00123456789012345601',
    nome_beneficiario: 'Ana Clara Silva',
    cod_plano: '101',
    status_beneficiario: 'Ativo',
    
    // 3. Prestadores
    cod_prestador_solicitante: 'CRM-SP-123456',
    nome_solicitante: 'Dr. Roberto Silva',
    cod_prestador_executante: 'RDA-998877',
    nome_executante: 'Hospital das Clínicas Central',
    cnes_local: '2079576',
    
    // 4. Clínicos
    cid_principal: 'I10',
    cod_tuss: '40301230',
    descricao_procedimento: 'Hemograma Completo',
    qtd_solicitada: 1,
    qtd_autorizada: 1,
    
    // 5. Regulação
    status_autorizacao: '1-Autorizada',
    motivo_negativa_tiss: '',
    justificativa_negativa: '',
    cod_auditor_medico: 'AUD-5544',
    origem_liberacao: 'Automática',
    
    // 6. Financeiro
    valor_tabela_bruto: 45.00,
    valor_coparticipacao: 9.00,
    isento_copart: 'Não'
  },
  {
    id: 2,
    num_guia: '10002569',
    guia_prestador: 'GP-2024-002',
    senha_autorizacao: '',
    tipo_guia: '2-SPSADT',
    carater_atendimento: 'U-Urgência',
    data_solicitacao: '2024-09-19T11:15:00',
    validade_guia: '2024-10-19',
    executada: 'NÃO',
    carteirinha: '00123456789012345602',
    nome_beneficiario: 'Carlos Eduardo Santos',
    cod_plano: '202',
    status_beneficiario: 'Ativo',
    cod_prestador_solicitante: 'CRM-SP-654321',
    nome_solicitante: 'Dra. Fernanda Lins',
    cod_prestador_executante: 'RDA-112233',
    nome_executante: 'Laboratório Central Diagnósticos',
    cnes_local: '2079577',
    cid_principal: 'M54.5',
    cod_tuss: '40801010',
    descricao_procedimento: 'Ressonância Magnética de Coluna Lombar',
    qtd_solicitada: 1,
    qtd_autorizada: 0,
    status_autorizacao: '3-Em Análise/Auditoria',
    motivo_negativa_tiss: '',
    justificativa_negativa: 'Aguardando parecer técnico da auditoria neurológica.',
    cod_auditor_medico: 'AUD-2211',
    origem_liberacao: 'Manual',
    valor_tabela_bruto: 850.00,
    valor_coparticipacao: 170.00,
    isento_copart: 'Não'
  },
  {
    id: 3,
    num_guia: '10002570',
    guia_prestador: 'GP-2024-003',
    senha_autorizacao: '',
    tipo_guia: '1-Consulta',
    carater_atendimento: 'E-Eletivo',
    data_solicitacao: '2024-09-18T14:20:00',
    validade_guia: '2024-09-18',
    executada: 'NÃO',
    carteirinha: '00123456789012345603',
    nome_beneficiario: 'Maria Oliveira',
    cod_plano: '101',
    status_beneficiario: 'Bloqueado',
    cod_prestador_solicitante: 'CRM-SP-111222',
    nome_solicitante: 'Dr. Marcos Paulo',
    cod_prestador_executante: 'RDA-445566',
    nome_executante: 'Clínica de Especialidades São José',
    cnes_local: '2079578',
    cid_principal: 'Z00.0',
    cod_tuss: '10101012',
    descricao_procedimento: 'Consulta em Consultório',
    qtd_solicitada: 1,
    qtd_autorizada: 0,
    status_autorizacao: '2-Negada',
    motivo_negativa_tiss: '1302',
    justificativa_negativa: 'Beneficiário com situação financeira irregular (Inadimplente).',
    cod_auditor_medico: 'SISTEMA',
    origem_liberacao: 'Automática',
    valor_tabela_bruto: 120.00,
    valor_coparticipacao: 0.00,
    isento_copart: 'Não'
  }
]

export default mockGuias
