// Arquivo: src/modules/dut/views/DutList.jsx
// Descrição: Visão do módulo DUT exibindo as Diretrizes de Utilização diretamente via PDF oficial da ANS.

import { Header, Button } from '@layout'

export default function DutList() {
  const pdfUrl = 'https://www.ans.gov.br/images/stories/Legislacao/rn/rn465/Anexo_II_DUT_2021_RN_465.2021_RN676.2026.pdf'
  // Usando o visualizador do Google como proxy para tentar contornar bloqueios de iframe
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, height: '100%', width: '100%', overflow: 'hidden' }}>
      <Header
        title="Diretrizes de Utilização (DUT) - ANS"
        showSearchAndFilter={false}
        actions={[
          <Button 
            key="open-pdf" 
            onClick={() => window.open(pdfUrl, '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Abrir PDF em Nova Aba
          </Button>
        ]}
      />
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 0,
          padding: '2rem',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p>O visualizador de PDF pode ser bloqueado por restrições do portal ANS.</p>
          <Button variant="secondary" onClick={() => window.open(pdfUrl, '_blank')}>Clique aqui para abrir o documento original</Button>
        </div>
        
        <iframe
          src={googleViewerUrl}
          title="DUT ANS"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#f1f5f9',
            position: 'relative',
            zIndex: 1
          }}
        />
      </div>
    </div>
  )
}
