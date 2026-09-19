// Arquivo: src/modules/tuss/views/TussList.jsx
// Descrição: Visão de listagem do módulo TUSS com paginação integrada, filtros de status e busca em dados ANS.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Header, Table } from '@layout'
import { usePagination } from '@shared/context'

// ==========================================
// Definição de Colunas da Tabela TUSS
// ==========================================

const columns = [
  { header: 'Código', key: 'codigo', minWidth: '100px', maxWidth: '120px' },
  { header: 'Terminologia e Procedimento', key: 'descricao', minWidth: '180px', maxWidth: '200px' },
  { header: 'Diretrizes Clínicas e Cobertura', key: 'diretrizes', minWidth: '180px', maxWidth: '200px' },
  { header: 'Especialidade', key: 'especialidade', minWidth: '140px', maxWidth: '180px' },
  { header: 'Rol ANS', key: 'rolAns', minWidth: '120px', maxWidth: '160px' },
  { header: 'Status', key: 'status', minWidth: '90px', maxWidth: '110px' },
  { header: 'Última Revisão', key: 'revisao', minWidth: '130px', maxWidth: '150px' }
]

// ==========================================
// Base de Dados Simulada Paginada
// ==========================================

const mockDataByPage = {
  1: [
    {
      codigo: '10101012',
      descricao: 'Consulta médica em consultório (no horário normal ou preestabelecido)',
      diretrizes: 'Cobertura obrigatória para planos ambulatoriais e hospitalares com obstetrícia segundo diretrizes da RN ANS n° 465/2021.',
      especialidade: 'Clínica Médica Geral',
      rolAns: 'Obrigatório Nacional',
      status: 'Ativo',
      revisao: '12/08/2024'
    },
    {
      codigo: '10101020',
      descricao: 'Consulta em pronto-socorro geral ou pediátrico para triagem e urgência',
      diretrizes: 'Atendimento de urgência e emergência sem exigência de carência após 24h da contratação formal do plano.',
      especialidade: 'Medicina de Urgência',
      rolAns: 'Obrigatório Nacional',
      status: 'Ativo',
      revisao: '15/09/2024'
    }
  ],
  2: [
    {
      codigo: '40101010',
      descricao: 'Eletrocardiograma convencional de 12 derivações com laudo especializado',
      diretrizes: 'Indicado para avaliação cardiológica de rotina, pré-operatório e dor precordial suspeita.',
      especialidade: 'Cardiologia Clínica',
      rolAns: 'Obrigatório Nacional',
      status: 'Ativo',
      revisao: '04/07/2024'
    },
    {
      codigo: '40301608',
      descricao: 'Hemograma completo com contagem de plaquetas e frações automatizadas',
      diretrizes: 'Investigação hematológica de rotina, anemias, infecções agudas e monitoramento oncológico.',
      especialidade: 'Patologia Clínica',
      rolAns: 'Obrigatório Nacional',
      status: 'Ativo',
      revisao: '22/08/2024'
    }
  ],
  3: [
    {
      codigo: '40901122',
      descricao: 'Ultrassonografia de abdome total com dopplerfluxometria e mapeamento vascular',
      diretrizes: 'Exige justificativa clínica prévia com indicação precisa para órgãos sólidos e sistema vascular.',
      especialidade: 'Radiologia e Diagnóstico',
      rolAns: 'Diretriz de Utilização',
      status: 'Ativo',
      revisao: '11/06/2024'
    },
    {
      codigo: '40804054',
      descricao: 'Radiografia de tórax padrão em projeções PA e perfil esquerdo completo',
      diretrizes: 'Triagem pulmonar, suspeita de pneumonia, avaliação de silhueta cardíaca e trauma torácico.',
      especialidade: 'Radiologia Convencional',
      rolAns: 'Obrigatório Nacional',
      status: 'Pendente',
      revisao: '30/08/2024'
    }
  ],
  4: [
    {
      codigo: '41101018',
      descricao: 'Ressonância magnética de encéfalo com espectroscopia e difusão de água',
      diretrizes: 'Investigação de doenças desmielinizantes, cefaleias refratárias, tumores e acidente vascular encefálico.',
      especialidade: 'Neurorradiologia',
      rolAns: 'Diretriz de Utilização',
      status: 'Ativo',
      revisao: '19/05/2024'
    },
    {
      codigo: '41001013',
      descricao: 'Tomografia computadorizada de crânio e órbitas com reconstrução tridimensional',
      diretrizes: 'Trauma cranioencefálico, hemorragia aguda intracraniana e avaliação pré-cirúrgica bucomaxilofacial.',
      especialidade: 'Diagnóstico por Imagem',
      rolAns: 'Obrigatório Nacional',
      status: 'Ativo',
      revisao: '03/09/2024'
    }
  ],
  5: [
    {
      codigo: '40201082',
      descricao: 'Endoscopia digestiva alta diagnóstica com teste rápido de urease e biópsias',
      diretrizes: 'Investigação de dispepsia persistente, refluxo gastroesofágico refratário e hemorragia digestiva.',
      especialidade: 'Gastroenterologia',
      rolAns: 'Obrigatório Nacional',
      status: 'Ativo',
      revisao: '14/09/2024'
    },
    {
      codigo: '40201147',
      descricao: 'Colonoscopia total com magnificação óptica e polipectomia preventiva',
      diretrizes: 'Rastreamento de neoplasia colorretal a partir dos 45 anos ou histórico familiar precoce.',
      especialidade: 'Coloproctologia',
      rolAns: 'Diretriz de Utilização',
      status: 'Ativo',
      revisao: '18/09/2024'
    }
  ]
}

// ==========================================
// Componente TussList
// ==========================================

export default function TussList() {
  const { setPagination, resetPagination } = usePagination()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const totalPages = 5

  // ==========================================
  // Filtragem e Busca de Dados
  // ==========================================

  const filteredData = useMemo(() => {
    const raw = mockDataByPage[currentPage] || mockDataByPage[1] || []
    return raw.filter((item) => {
      if (statusFilter && item.status !== statusFilter) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return Object.values(item).some(val => String(val).toLowerCase().includes(q))
    })
  }, [currentPage, searchQuery, statusFilter])

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage)
  }, [])

  // ==========================================
  // Efeito de Sincronização da Paginação
  // ==========================================

  useEffect(() => {
    setPagination({
      currentPage,
      totalPages,
      onPageChange: handlePageChange,
      visible: true
    })

    return () => {
      resetPagination()
    }
  }, [currentPage, totalPages, handlePageChange, setPagination, resetPagination])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', width: '100%', overflow: 'hidden' }}>
      <Header
        title="TUSS"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={statusFilter}
        onSelectFilter={setStatusFilter}
        filterOptions={[
          { label: 'Todos os Status', value: 'todos' },
          { label: 'Ativo', value: 'Ativo' },
          { label: 'Pendente', value: 'Pendente' }
        ]}
      />
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Table columns={columns} data={filteredData} />
      </div>
    </div>
  )
}
