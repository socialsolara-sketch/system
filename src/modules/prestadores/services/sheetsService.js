// Arquivo: src/modules/prestadores/services/sheetsService.js
// Descrição: Serviço para integração com a API do Google Sheets.

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;

/**
 * Busca dados de uma planilha do Google Sheets.
 * @param {string} range O intervalo da planilha (ex: 'PRESTADORES!A:Z')
 * @returns {Promise<Object>} Objeto com dados mapeados e headers
 */
export const fetchFromSheets = async (range = 'PRESTADORES!A:Z') => {
  // Se não houver ID, usa mock baseado no range
  if (!SPREADSHEET_ID || SPREADSHEET_ID.trim() === "") {
    console.warn(`VITE_GOOGLE_SHEETS_ID não configurado para range ${range}. Usando dados mockados.`);
    return { data: getMockDataByRange(range), isMock: true };
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error(`Erro ao buscar range ${range}:`, data.error.message);
      return { data: getMockDataByRange(range), isMock: true, error: data.error.message };
    }

    if (!data.values || data.values.length === 0) {
      return { data: [], isMock: false };
    }

    const [headers, ...rows] = data.values;

    const mappedData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        const key = header.toLowerCase().trim().replace(/\s+/g, '_');
        obj[key] = row[index] || '';
      });
      return obj;
    });

    return { 
      data: mappedData, 
      headers: headers.map(h => ({ key: h.toLowerCase().trim().replace(/\s+/g, '_'), original: h })),
      isMock: false 
    };
  } catch (error) {
    console.error(`Erro de rede ao buscar range ${range}:`, error);
    return { data: getMockDataByRange(range), isMock: true, error: error.message };
  }
};

/**
 * Legado: Mantém compatibilidade com chamadas antigas
 */
export const fetchPrestadoresFromSheets = () => fetchFromSheets('PRESTADORES!A:Z');

/**
 * Retorna dados mockados baseados no range solicitado.
 */
const getMockDataByRange = (range) => {
  if (range.includes('PRESTADORES')) {
    return [
      { id: '1', nome: 'HOSPITAL SANTA ROSA', tipo: 'HOSPITAL', cidade: 'CUIABÁ', uf: 'MT', status: 'ATIVO' },
      { id: '2', nome: 'CLÍNICA SÃO MATEUS', tipo: 'CLÍNICA', cidade: 'CUIABÁ', uf: 'MT', status: 'ATIVO' },
      { id: '3', nome: 'LABORATÓRIO CARLOS CHAGAS', tipo: 'LABORATÓRIO', cidade: 'VÁRZEA GRANDE', uf: 'MT', status: 'ATIVO' },
      { id: '4', nome: 'DR. RICARDO ALMEIDA', tipo: 'CONSULTÓRIO', cidade: 'CUIABÁ', uf: 'MT', status: 'INATIVO' },
      { id: '5', nome: 'HOSPITAL FEMINA', tipo: 'HOSPITAL', cidade: 'CUIABÁ', uf: 'MT', status: 'ATIVO' },
    ];
  }
  
  if (range.includes('CIDADES')) {
    return [
      { id: '1', nome: 'OSVALDO CRUZ', uf: 'SP' },
      { id: '2', nome: 'CUIABÁ', uf: 'MT' },
      { id: '3', nome: 'VÁRZEA GRANDE', uf: 'MT' },
      { id: '4', nome: 'SÃO PAULO', uf: 'SP' },
      { id: '5', nome: 'RIO DE JANEIRO', uf: 'RJ' },
    ];
  }

  if (range.includes('ESTADOS')) {
    return [
      { id: '1', sigla: 'MT', nome: 'MATO GROSSO' },
      { id: '2', sigla: 'SP', nome: 'SÃO PAULO' },
      { id: '3', sigla: 'RJ', nome: 'RIO DE JANEIRO' },
    ];
  }

  if (range.includes('LOCAL')) {
    return [
      { id: '1', nome: 'CLÍNICA' },
      { id: '2', nome: 'HOSPITAL' },
      { id: '3', nome: 'CONSULTÓRIO' },
      { id: '4', nome: 'LABORATÓRIO' },
    ];
  }

  return [];
};
