// Arquivo: src/modules/usuario/data/mockUsuarios.js
// Descrição: Dados simulados (mockup) de usuários/beneficiários com todas as colunas da especificação TISS/ANS e informações detalhadas de contratos.

export const mockUsuarios = [
  {
    id: 1,
    codigo_carteirinha: '00123456789012345601',
    nome_completo: 'Ana Silva Oliveira',
    cpf: '12345678901',
    rg: '123456789',
    orgao_emissor_rg: 'SSP/SP',
    cns: '701234567890123',
    data_nascimento: '1988-05-14',
    sexo: 'F',
    nome_mae: 'Maria Helena Silva',
    estado_civil: 'Casada',

    tipo_beneficiario: 'Titular',
    id_titular: null,
    grau_parentesco: null,
    
    // Novas informações robustas de Contrato ANS/TISS
    numero_contrato: 'CTR-2024-9981',
    tipo_contrato: 'Coletivo Empresarial',
    estipulante_nome: 'Tecnologia Avançada Ltda',
    estipulante_cnpj: '12.345.678/0001-90',
    segmentacao_assistencial: 'Ambulatorial + Hospitalar com Obstetrícia',
    tipo_cobertura: 'Nacional',
    tipo_acomodacao: 'Apartamento',
    registro_ans_plano: '487.210/20-4',
    nome_comercial_plano: 'Pleno Prata Gold',
    coparticipacao_indicador: true,
    valor_mensalidade: 450.00,
    situacao_financeira_contrato: 'Adimplente',
    id_plano: 101,

    situacao_cadastral: 'Ativo',
    data_adesao: '2022-01-15',
    data_cancelamento: null,
    motivo_cancelamento: null,

    cpt_indicador: true,
    inicio_carencia_contratual: '2022-01-15',
    fim_carencia_contratual: '2022-07-15',
    fim_carencia_consultas: '2022-02-15',
    fim_carencia_exames: '2022-04-15',
    fim_carencia_internacao: '2022-07-15',
    fim_carencia_parto: '2022-11-15',

    cpts: [
      { id: 101, patologia: 'Cardiopatia Isquêmica', recurso: 'Cirurgia, Angioplastia, Cintilografia de Miocárdio' },
      { id: 102, patologia: 'Hérnia de Disco Lombar', recurso: 'Ressonância Magnética, Fisioterapia, Cirurgia de Coluna' },
      { id: 103, patologia: 'Diabetes Mellitus Tipo II', recurso: 'Monitoramento de Glicemia, Exames Endocrinológicos, Internação por Cetoacidose' },
      { id: 104, patologia: 'Hipertensão Arterial Sistêmica', recurso: 'Teste Ergométrico, Ecocardiograma, Holter, MAPA' },
      { id: 105, patologia: 'Artrose de Joelho', recurso: 'Prótese Articular, Infiltração de Ácido Hialurônico, Fisioterapia' },
      { id: 106, patologia: 'Catarata Bilateral', recurso: 'Cirurgia de Catarata, Implante de Lente Intraocular, Mapeamento de Retina' },
      { id: 107, patologia: 'Colelitíase (Pedra na Vesícula)', recurso: 'Colecistectomia por Videolaparoscopia, Ultrassonografia de Abdome Total' },
      { id: 108, patologia: 'Asma Brônquica', recurso: 'Espirometria, Prova de Função Pulmonar, Consultas de Pneumologia' },
      { id: 109, patologia: 'Insuficiência Renal Crônica', recurso: 'Hemodiálise, Diálise Peritoneal, Ultrassom de Vias Urinárias' },
      { id: 110, patologia: 'Hipotireoidismo', recurso: 'Dosagem de TSH, T4 Livre, Ultrassonografia de Tireoide' },
      { id: 111, patologia: 'Gastrite Crônica', recurso: 'Endoscopia Digestiva Alta, Pesquisa de H. Pylori' },
      { id: 112, patologia: 'Síndrome do Túnel do Carpo', recurso: 'Eletroneuromiografia, Cirurgia de Descompressão' },
      { id: 113, patologia: 'Miomatose Uterina', recurso: 'Histerectomia, Ultrassonografia Transvaginal' },
      { id: 114, patologia: 'Obesidade Grau III', recurso: 'Cirurgia Bariátrica, Acompanhamento Multidisciplinar' },
      { id: 115, patologia: 'Depressão Crônica', recurso: 'Psicoterapia, Consultas de Psiquiatria' }
    ],

    email: 'ana.oliveira@email.com',
    telefone_celular: '11987654321',
    cep: '01310100',
    logradouro: 'Av. Paulista',
    numero: '1000',
    complemento: 'Apto 42',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',

    hash_senha: '$2a$12$eImiTXuWVxfM37uY4JANjO28vK1mU09d.28zP.a1P9sKj991m',
    primeiro_acesso: false,
    created_at: '2022-01-15 08:30:00',
    updated_at: '2024-09-18 10:00:00'
  },
  {
    id: 2,
    codigo_carteirinha: '00123456789012345602',
    nome_completo: 'Lucas Oliveira Santos',
    cpf: '98765432100',
    rg: '987654321',
    orgao_emissor_rg: 'DETRAN/RJ',
    cns: '709876543210987',
    data_nascimento: '2015-09-20',
    sexo: 'M',
    nome_mae: 'Ana Silva Oliveira',
    estado_civil: 'Solteiro',

    tipo_beneficiario: 'Dependente',
    id_titular: 1,
    grau_parentesco: 'Filho',
    
    // Novas informações robustas de Contrato ANS/TISS
    numero_contrato: 'CTR-2024-9981',
    tipo_contrato: 'Coletivo Empresarial',
    estipulante_nome: 'Tecnologia Avançada Ltda',
    estipulante_cnpj: '12.345.678/0001-90',
    segmentacao_assistencial: 'Ambulatorial + Hospitalar com Obstetrícia',
    tipo_cobertura: 'Nacional',
    tipo_acomodacao: 'Apartamento',
    registro_ans_plano: '487.210/20-4',
    nome_comercial_plano: 'Pleno Prata Gold',
    coparticipacao_indicador: true,
    valor_mensalidade: 220.00,
    situacao_financeira_contrato: 'Adimplente',
    id_plano: 101,

    situacao_cadastral: 'Ativo',
    data_adesao: '2022-01-15',
    data_cancelamento: null,
    motivo_cancelamento: null,

    cpt_indicador: false,
    inicio_carencia_contratual: '2022-01-15',
    fim_carencia_contratual: '2022-07-15',
    fim_carencia_consultas: '2022-02-15',
    fim_carencia_exames: '2022-04-15',
    fim_carencia_internacao: '2022-07-15',
    fim_carencia_parto: null,

    cpts: [],

    email: 'lucas.santos@email.com',
    telefone_celular: '11976543210',
    cep: '01310100',
    logradouro: 'Av. Paulista',
    numero: '1000',
    complemento: 'Apto 42',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    uf: 'SP',

    hash_senha: '$2a$12$k83Hjs82Hms92Sj2KmL22pP92n01P82mS31sM88kP21xX',
    primeiro_acesso: true,
    created_at: '2022-01-15 09:15:00',
    updated_at: '2024-08-10 14:20:00'
  },
  {
    id: 3,
    codigo_carteirinha: '00123456789012345603',
    nome_completo: 'Carlos Eduardo Mendes',
    cpf: '45678912345',
    rg: '456789123',
    orgao_emissor_rg: 'SSP/MG',
    cns: '704567891234567',
    data_nascimento: '1975-11-03',
    sexo: 'M',
    nome_mae: 'Clara Mendes',
    estado_civil: 'Divorciado',

    tipo_beneficiario: 'Titular',
    id_titular: null,
    grau_parentesco: null,
    
    // Novas informações robustas de Contrato ANS/TISS
    numero_contrato: 'CTR-2023-4102',
    tipo_contrato: 'Individual / Familiar',
    estipulante_nome: 'N/A (Individual)',
    estipulante_cnpj: 'N/A',
    segmentacao_assistencial: 'Ambulatorial + Hospitalar sem Obstetrícia',
    tipo_cobertura: 'Regional',
    tipo_acomodacao: 'Enfermaria',
    registro_ans_plano: '354.120/15-2',
    nome_comercial_plano: 'Essencial Regional',
    coparticipacao_indicador: false,
    valor_mensalidade: 380.00,
    situacao_financeira_contrato: 'Adimplente',
    id_plano: 202,

    situacao_cadastral: 'Cancelado',
    data_adesao: '2023-03-01',
    data_cancelamento: '2024-06-30',
    motivo_cancelamento: 'Solicitação do beneficiário',

    cpt_indicador: true,
    inicio_carencia_contratual: '2023-03-01',
    fim_carencia_contratual: '2023-09-01',
    fim_carencia_consultas: '2023-04-01',
    fim_carencia_exames: '2023-06-01',
    fim_carencia_internacao: '2023-09-01',
    fim_carencia_parto: null,

    cpts: [
      { id: 301, patologia: 'Artrose de Joelho', recurso: 'Prótese Articular, Infiltração, Fisioterapia' }
    ],

    email: 'carlos.mendes@email.com',
    telefone_celular: '31998765432',
    cep: '30130000',
    logradouro: 'Av. Afonso Pena',
    numero: '1500',
    complemento: 'Sala 801',
    bairro: 'Centro',
    cidade: 'Belo Horizonte',
    uf: 'MG',

    hash_senha: '$2a$12$x92Kw00Sml2O19sM72aL001xP988zL12kX82pL00aX981',
    primeiro_acesso: false,
    created_at: '2023-03-01 11:00:00',
    updated_at: '2024-06-30 17:45:00'
  }
]

export const availableCPTs = [
  { id: 'cpt-1', patologia: 'Diabetes Mellitus Tipo II', recurso: 'Monitoramento de Glicemia, Exames Endocrinológicos, Internação por Cetoacidose' },
  { id: 'cpt-2', patologia: 'Hipertensão Arterial Sistêmica', recurso: 'Teste Ergométrico, Ecocardiograma, Holter, MAPA' },
  { id: 'cpt-3', patologia: 'Cardiopatia Isquêmica', recurso: 'Cirurgia Cardíaca, Angioplastia, Cintilografia de Miocárdio' },
  { id: 'cpt-4', patologia: 'Hérnia de Disco Lombar', recurso: 'Ressonância Magnética, Fisioterapia, Cirurgia de Coluna' },
  { id: 'cpt-5', patologia: 'Artrose de Joelho', recurso: 'Prótese Articular, Infiltração de Ácido Hialurônico, Fisioterapia' },
  { id: 'cpt-6', patologia: 'Catarata Bilateral', recurso: 'Cirurgia de Catarata, Implante de Lente Intraocular, Mapeamento de Retina' },
  { id: 'cpt-7', patologia: 'Colelitíase (Pedra na Vesícula)', recurso: 'Colecistectomia por Videolaparoscopia, Ultrassonografia de Abdome Total' },
  { id: 'cpt-8', patologia: 'Asma Brônquica', recurso: 'Espirometria, Prova de Função Pulmonar, Consultas de Pneumologia' },
  { id: 'cpt-9', patologia: 'Insuficiência Renal Crônica', recurso: 'Hemodiálise, Diálise Peritoneal, Ultrassom de Vias Urinárias' },
  { id: 'cpt-10', patologia: 'Hipotireoidismo', recurso: 'Dosagem de TSH, T4 Livre, Ultrassonografia de Tireoide' },
  { id: 'cpt-11', patologia: 'Gastrite Crônica / Úlceras', recurso: 'Endoscopia Digestiva Alta, Pesquisa de H. Pylori' },
  { id: 'cpt-12', patologia: 'Síndrome do Túnel do Carpo', recurso: 'Eletroneuromiografia, Cirurgia de Descompressão' },
  { id: 'cpt-13', patologia: 'Miomatose Uterina', recurso: 'Histerectomia, Ultrassonografia Transvaginal' },
  { id: 'cpt-14', patologia: 'Obesidade Grau III', recurso: 'Cirurgia Bariátrica, Acompanhamento Multidisciplinar' },
  { id: 'cpt-15', patologia: 'Depressão Crônica / Ansiedade', recurso: 'Psicoterapia, Consultas de Psiquiatria' },
  { id: 'cpt-16', patologia: 'Osteoporose Senil', recurso: 'Densitometria Óssea, Consultas de Reumatologia' },
  { id: 'cpt-17', patologia: 'Artrite Reumatoide', recurso: 'Pesquisa de Fator Reumatoide, Medicamentos Biológicos' },
  { id: 'cpt-18', patologia: 'Apneia Obstrutiva do Sono', recurso: 'Polissonografia, Ajuste de CPAP, Clínica do Sono' },
  { id: 'cpt-19', patologia: 'Doença de Crohn', recurso: 'Colonoscopia, Enteroressonância, Imunobiológicos' },
  { id: 'cpt-20', patologia: 'Psoríase Crônica', recurso: 'Fototerapia, Consultas Dermatológicas, Terapia Tópica Especializada' }
]

export default mockUsuarios
