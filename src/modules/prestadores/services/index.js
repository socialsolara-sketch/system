// Arquivo: src/modules/prestadores/services/index.js
// Descrição: Exportação centralizada dos serviços do módulo de prestadores

export {
  initDatabase,
  executeQuery,
  executeNonQuery,
  getSchema,
  closeDatabase,
  exportDatabase
} from './sqliteClient'

export {
  fetchPrestadores,
  getPrestadorById,
  fetchEspecialidades,
  fetchPlanos,
  savePrestador,
  deletePrestador
} from './prestadorService'

export {
  fetchAcordosByPrestador,
  getAcordoById,
  saveAcordo,
  deleteAcordo
} from './acordoTussService'