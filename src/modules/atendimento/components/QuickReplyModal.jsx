// Arquivo: src/modules/atendimento/components/QuickReplyModal.jsx
import { useState, useRef } from 'react'
import { motion } from 'motion/react'
import { useTheme } from '@shared/context/ThemeContext'
import { Button } from '@shared/layout'

export default function QuickReplyModal({ isOpen, onClose, quickReplies, setQuickReplies }) {
  const { currentTheme } = useTheme()
  const constraintsRef = useRef(null)
  const [isEditing, setIsEditing] = useState(null)
  const [formData, setFormData] = useState({ title: '', message: '' })

  if (!isOpen) return null

  const handleSave = () => {
    if (isEditing) {
      setQuickReplies(quickReplies.map(r => r.id === isEditing ? { ...formData, id: isEditing } : r))
    } else {
      setQuickReplies([...quickReplies, { ...formData, id: Date.now() }])
    }
    setIsEditing(null)
    setFormData({ title: '', message: '' })
  }

  const handleDelete = (id) => {
    setQuickReplies(quickReplies.filter(r => r.id !== id))
  }

  return (
    <div 
      ref={constraintsRef}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, overflow: 'hidden' }}
    >
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        dragElastic={0}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ backgroundColor: currentTheme?.colors?.card, padding: '1.5rem', borderRadius: '8px', width: '400px', border: `1px solid ${currentTheme?.colors?.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
      >
        <div 
          style={{ cursor: 'grab', marginBottom: '1rem' }}
          onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
          onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
        >
          <h2 style={{ color: currentTheme?.colors?.textPrimary, margin: 0 }}>Gerenciar Respostas Rápidas</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          <input placeholder="Título" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary }} />
          <textarea placeholder="Mensagem" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: `1px solid ${currentTheme?.colors?.border}`, backgroundColor: currentTheme?.colors?.input, color: currentTheme?.colors?.textPrimary, minHeight: '80px' }} />
          <Button onClick={handleSave}>{isEditing ? 'Atualizar' : 'Adicionar'}</Button>
        </div>

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {quickReplies.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: `1px solid ${currentTheme?.colors?.border}` }}>
              <span style={{ color: currentTheme?.colors?.textPrimary }}>{r.title}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { setIsEditing(r.id); setFormData(r) }} style={{ color: currentTheme?.colors?.primary, border: 'none', background: 'none', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDelete(r.id)} style={{ color: currentTheme?.colors?.error, border: 'none', background: 'none', cursor: 'pointer' }}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" onClick={onClose} style={{ marginTop: '1rem', width: '100%' }}>Fechar</Button>
      </motion.div>
    </div>
  )
}
