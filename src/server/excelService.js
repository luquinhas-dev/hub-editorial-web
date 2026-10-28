import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

const EXCEL_PATH = path.resolve(process.cwd(), 'Database Controle Editorial.xlsx');
const DOWNLOADS_PATH = path.resolve('/home/luccas/Downloads', 'Database Controle Editorial.xlsx');

export async function getWorkbook() {
  const wb = new ExcelJS.Workbook();
  if (fs.existsSync(EXCEL_PATH)) {
    await wb.xlsx.readFile(EXCEL_PATH);
  } else {
    throw new Error(`Planilha não encontrada em ${EXCEL_PATH}`);
  }
  return wb;
}

export async function saveWorkbook(wb) {
  await wb.xlsx.writeFile(EXCEL_PATH);
  try {
    // Mantém cópia de segurança em Downloads
    await wb.xlsx.writeFile(DOWNLOADS_PATH);
  } catch (err) {
    console.warn('Não foi possível salvar cópia em Downloads:', err.message);
  }
}

export async function getAllEditorialData() {
  const wb = await getWorkbook();

  // 1. Planejamento
  const wsPlan = wb.getWorksheet('Planejamento');
  const planHeaders = [];
  const planejamento = [];
  if (wsPlan) {
    wsPlan.getRow(1).eachCell((cell, colNumber) => {
      planHeaders[colNumber] = String(cell.value || '').trim();
    });
    wsPlan.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const item = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const h = planHeaders[colNumber];
        if (h) item[h] = cell.value;
      });
      if (item['ID'] || item['Tema']) {
        let rawMetrics = row.getCell(16).value || item['Métricas Instagram'] || item['Métricas'] || null;
        let parsedMetrics = null;
        if (rawMetrics) {
          if (typeof rawMetrics === 'object') {
            parsedMetrics = rawMetrics;
          } else if (typeof rawMetrics === 'string') {
            try {
              parsedMetrics = JSON.parse(rawMetrics);
            } catch (e) {
              parsedMetrics = { texto: rawMetrics };
            }
          }
        }

        planejamento.push({
          id: String(item['ID'] || `ICR-${String(rowNumber).padStart(3, '0')}`),
          data: item['Data'] ? String(item['Data']).slice(0, 16) : '',
          diaSemana: item['Dia da Semana'] || '',
          tema: item['Tema'] || '',
          pilar: item['Pilar'] || 'Teologia',
          objetivo: item['Objetivo'] || 'Engajamento',
          formato: item['Formato'] || 'Carrossel',
          cta: item['CTA'] || '',
          responsavel: item['Responsável'] || 'Designers',
          prioridade: item['Prioridade'] || 'Média',
          status: item['Status'] || 'Ideia',
          linkCanva: item['Link Canva'] || '',
          linkInstagram: item['Link Instagram'] || item['Link Drive'] || '',
          linkDrive: item['Link Instagram'] || item['Link Drive'] || '',
          legenda: item['Legenda'] || '',
          observacoes: item['Observações'] || '',
          metricas: parsedMetrics
        });
      }
    });
  }

  // 2. Eventos
  const wsEv = wb.getWorksheet('Eventos');
  const eventos = [];
  if (wsEv) {
    wsEv.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const dataVal = row.getCell(1).value;
      const eventoVal = row.getCell(2).value;
      if (dataVal || eventoVal) {
        eventos.push({
          data: String(dataVal || '').slice(0, 10),
          evento: String(eventoVal || '')
        });
      }
    });
  }

  // 3. Reels
  const wsReels = wb.getWorksheet('Reels');
  const reels = [];
  if (wsReels) {
    wsReels.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const id = row.getCell(1).value;
      const tema = row.getCell(2).value;
      if (id || tema) {
        reels.push({
          id: String(id || ''),
          tema: String(tema || ''),
          gancho: String(row.getCell(3).value || ''),
          desenvolvimento: String(row.getCell(4).value || ''),
          cta: String(row.getCell(5).value || ''),
          tempoEstimado: String(row.getCell(6).value || ''),
          referenciaBiblica: String(row.getCell(7).value || ''),
          statusRoteiro: String(row.getCell(8).value || 'Ideia')
        });
      }
    });
  }

  // 4. Templates
  const wsTpl = wb.getWorksheet('Templates');
  const templates = [];
  if (wsTpl) {
    wsTpl.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      templates.push({
        categoria: String(row.getCell(1).value || ''),
        nome: String(row.getCell(2).value || ''),
        linkCanva: String(row.getCell(3).value || ''),
        linkDrive: String(row.getCell(4).value || ''),
        observacoes: String(row.getCell(5).value || '')
      });
    });
  }

  // 5. Biblioteca de Conteúdos Postados
  const wsBib = wb.getWorksheet('Biblioteca');
  const biblioteca = [];
  if (wsBib) {
    wsBib.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const id = row.getCell(1).value;
      const temaOriginal = row.getCell(2).value;
      if (id || temaOriginal) {
        biblioteca.push({
          id: String(id || ''),
          temaOriginal: String(temaOriginal || ''),
          pilar: String(row.getCell(3).value || 'Geral'),
          dataPostagem: String(row.getCell(4).value || '').slice(0, 10),
          linkFinal: String(row.getCell(5).value || ''),
          metricas: String(row.getCell(6).value || ''),
          reaproveitamento: String(row.getCell(7).value || '')
        });
      }
    });
  }

  // 6. Setup (Leitura dinâmica da aba Setup na planilha)
  const wsSetup = wb.getWorksheet('Setup');
  const setup = {
    pilares: [],
    formatos: [],
    status: [],
    objetivos: [],
    responsaveis: [],
    prioridades: [],
    voluntarios: [],
    funcoesEscala: []
  };

  if (wsSetup) {
    wsSetup.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const p = row.getCell(1).value;
      const f = row.getCell(2).value;
      const s = row.getCell(3).value;
      const o = row.getCell(4).value;
      const r = row.getCell(5).value;
      const pr = row.getCell(6).value;
      const vol = row.getCell(7).value;
      const func = row.getCell(8).value;

      if (p && !setup.pilares.includes(String(p).trim())) setup.pilares.push(String(p).trim());
      if (f && !setup.formatos.includes(String(f).trim())) setup.formatos.push(String(f).trim());
      if (s && !setup.status.includes(String(s).trim())) setup.status.push(String(s).trim());
      if (o && !setup.objetivos.includes(String(o).trim())) setup.objetivos.push(String(o).trim());
      if (r && !setup.responsaveis.includes(String(r).trim())) setup.responsaveis.push(String(r).trim());
      if (pr && !setup.prioridades.includes(String(pr).trim())) setup.prioridades.push(String(pr).trim());
      if (vol && !setup.voluntarios.includes(String(vol).trim())) setup.voluntarios.push(String(vol).trim());
      if (func && !setup.funcoesEscala.includes(String(func).trim())) setup.funcoesEscala.push(String(func).trim());
    });
  }

  // Fallbacks de segurança se a planilha estiver com colunas em branco
  if (!setup.pilares.length) setup.pilares = ['Teologia', 'Comunidade', 'Eventos', 'Devocional', 'Avisos'];
  if (!setup.formatos.length) setup.formatos = ['Carrossel', 'Reels', 'Story', 'Foto', 'Vídeo Longo'];
  if (!setup.status.length) setup.status = ['Ideia', 'Planejamento', 'Produção', 'Revisão', 'Agendado', 'Publicado'];
  if (!setup.responsaveis.length) setup.responsaveis = ['Lucas Marques', 'Designers', 'Equipe Mídia', 'Pastoral'];
  if (!setup.responsaveis.includes('Lucas Marques')) setup.responsaveis.unshift('Lucas Marques');
  if (!setup.prioridades.length) setup.prioridades = ['Baixa', 'Média', 'Alta', 'Urgente'];
  if (!setup.voluntarios.length) {
    setup.voluntarios = ['Lucas Marques', 'Sarah Oliveira', 'Mateus Silva', 'Débora Santos', 'Gabriel Costa', 'Pr. Arthur', 'Mariana Souza', 'Felipe Rocha'];
  }
  if (!setup.funcoesEscala.length) {
    setup.funcoesEscala = ['Fotografia', 'Cobertura Stories', 'Transmissão YouTube', 'Projeção / Letras', 'Gravação de Reels', 'Operação de Som', 'Design & Telão', 'Apoio Geral'];
  }

  setup.cultosFixos = [
    { id: 'fixo-terca', nome: 'Culto de Ensino', diaSemana: 'terça-feira', horaPadrao: '20:00', tipoData: 'Data Fixa (Culto)' },
    { id: 'fixo-dom-manha', nome: 'Culto de Celebração (Manhã)', diaSemana: 'domingo', horaPadrao: '10:00', tipoData: 'Data Fixa (Culto)' },
    { id: 'fixo-dom-noite', nome: 'Culto de Celebração (Noite)', diaSemana: 'domingo', horaPadrao: '19:00', tipoData: 'Data Fixa (Culto)' }
  ];

  // 7. Escala de Equipe
  const wsEscala = wb.getWorksheet('Escala');
  const escala = [];
  if (wsEscala) {
    wsEscala.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const id = row.getCell(1).value;
      const dataVal = row.getCell(2).value;
      const pessoa = row.getCell(6).value;
      const funcao = row.getCell(7).value;
      if (id || dataVal || pessoa || funcao) {
        escala.push({
          id: String(id || `ESC-${String(rowNumber - 1).padStart(3, '0')}`).trim(),
          data: String(dataVal || '').slice(0, 16),
          diaSemana: String(row.getCell(3).value || '').trim(),
          tipoData: String(row.getCell(4).value || 'Data Fixa (Culto)').trim(),
          evento: String(row.getCell(5).value || '').trim(),
          pessoa: String(row.getCell(6).value || '').trim(),
          funcao: String(row.getCell(7).value || '').trim(),
          status: String(row.getCell(8).value || 'Pendente').trim(),
          observacoes: String(row.getCell(9).value || '').trim()
        });
      }
    });
  }

  // 8. Manual Editorial
  const wsMan = wb.getWorksheet('Manual Editorial');
  const manual = [];
  if (wsMan) {
    wsMan.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      manual.push({
        topico: String(row.getCell(1).value || ''),
        diretriz: String(row.getCell(2).value || '')
      });
    });
  }

  return {
    planejamento,
    eventos,
    reels,
    templates,
    biblioteca,
    escala,
    setup,
    manual
  };
}

export async function saveOrUpdatePost(postData) {
  const wb = await getWorkbook();
  const ws = wb.getWorksheet('Planejamento');
  if (!ws) throw new Error('Aba Planejamento não encontrada');

  let targetRow = null;
  let maxIdNum = 0;

  // Busca se já existe post com esse ID ou calcula próximo ID
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cellId = String(row.getCell(1).value || '');
    if (postData.id && cellId === postData.id) {
      targetRow = row;
    }
    const match = cellId.match(/ICR-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });

  const diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  let computedDiaSemana = postData.diaSemana || '';
  if (postData.data) {
    const d = new Date(postData.data);
    if (!isNaN(d.getTime())) {
      computedDiaSemana = diasDaSemana[d.getDay()];
    }
  }

  const postId = postData.id || `ICR-${String(maxIdNum + 1).padStart(3, '0')}`;
  const values = [
    postId,
    postData.data || new Date().toISOString().slice(0, 16).replace('T', ' '),
    computedDiaSemana,
    postData.tema || postData.titulo || '',
    postData.pilar || 'Teologia',
    postData.objetivo || 'Engajamento',
    postData.formato || 'Carrossel',
    postData.cta || '',
    postData.responsavel || 'Lucas Marques',
    postData.prioridade || 'Média',
    postData.status || 'Ideia',
    postData.linkCanva || '',
    postData.linkInstagram || postData.linkDrive || '',
    postData.legenda || postData.pauta_resumo || '',
    postData.observacoes || ''
  ];

  const h16 = ws.getRow(1).getCell(16);
  if (!h16.value) {
    h16.value = 'Métricas Instagram';
    h16.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    h16.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D695D' } };
  }

  const metricasValue = postData.metricas 
    ? (typeof postData.metricas === 'object' ? JSON.stringify(postData.metricas) : String(postData.metricas))
    : null;

  if (targetRow) {
    // Atualização
    values.forEach((val, idx) => {
      targetRow.getCell(idx + 1).value = val;
    });
    if (metricasValue !== null) {
      targetRow.getCell(16).value = metricasValue;
    }
  } else {
    // Inserção
    if (metricasValue !== null) {
      values.push(metricasValue);
    }
    const newRow = ws.addRow(values);
    newRow.height = 20;
    // Estilo simples
    newRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  }

  await saveWorkbook(wb);
  return { ...postData, id: postId, diaSemana: computedDiaSemana };
}

export async function addSetupOption(category, value) {
  if (!category || !value) throw new Error('Categoria e valor são obrigatórios');
  const catMap = {
    pilares: 1,
    formatos: 2,
    status: 3,
    objetivos: 4,
    responsaveis: 5,
    prioridades: 6,
    voluntarios: 7,
    funcoes: 8,
    funcoesescala: 8
  };
  const colIndex = catMap[category.toLowerCase().replace(/[^a-z]/g, '')];
  if (!colIndex) throw new Error(`Categoria "${category}" inválida no Setup`);

  const wb = await getWorkbook();
  const ws = wb.getWorksheet('Setup');
  if (!ws) throw new Error('Aba Setup não encontrada');

  const cleanVal = String(value).trim();
  let found = false;
  let emptyRowIndex = null;

  for (let r = 2; r <= Math.max(ws.rowCount, 100); r++) {
    const cell = ws.getCell(r, colIndex);
    const v = String(cell.value || '').trim();
    if (v.toLowerCase() === cleanVal.toLowerCase()) {
      found = true;
      break;
    }
    if (!v && emptyRowIndex === null) {
      emptyRowIndex = r;
    }
  }

  if (!found) {
    const targetRow = emptyRowIndex || (ws.rowCount + 1);
    const cell = ws.getCell(targetRow, colIndex);
    cell.value = cleanVal;
    cell.font = { name: 'Calibri', size: 10 };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
    await saveWorkbook(wb);
  }

  return await getAllEditorialData();
}

export async function removeSetupOption(category, value) {
  if (!category || !value) throw new Error('Categoria e valor são obrigatórios');
  const catMap = {
    pilares: 1,
    formatos: 2,
    status: 3,
    objetivos: 4,
    responsaveis: 5,
    prioridades: 6,
    voluntarios: 7,
    funcoes: 8,
    funcoesescala: 8
  };
  const colIndex = catMap[category.toLowerCase().replace(/[^a-z]/g, '')];
  if (!colIndex) throw new Error(`Categoria "${category}" inválida no Setup`);

  const wb = await getWorkbook();
  const ws = wb.getWorksheet('Setup');
  if (!ws) throw new Error('Aba Setup não encontrada');

  const cleanVal = String(value).trim().toLowerCase();
  for (let r = 2; r <= ws.rowCount; r++) {
    const cell = ws.getCell(r, colIndex);
    if (String(cell.value || '').trim().toLowerCase() === cleanVal) {
      cell.value = null;
      break;
    }
  }

  await saveWorkbook(wb);
  return await getAllEditorialData();
}

export async function deletePostById(id) {
  const wb = await getWorkbook();
  const ws = wb.getWorksheet('Planejamento');
  if (!ws) throw new Error('Aba Planejamento não encontrada');

  let rowIndexToDelete = null;
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (String(row.getCell(1).value || '') === String(id)) {
      rowIndexToDelete = rowNumber;
    }
  });

  if (rowIndexToDelete) {
    ws.spliceRows(rowIndexToDelete, 1);
    await saveWorkbook(wb);
    return true;
  }
  return false;
}

export async function deleteReelById(id) {
  const wb = await getWorkbook();
  const ws = wb.getWorksheet('Reels');
  if (!ws) throw new Error('Aba Reels não encontrada');

  let rowIndexToDelete = null;
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (String(row.getCell(1).value || '').trim() === String(id).trim()) {
      rowIndexToDelete = rowNumber;
    }
  });

  if (rowIndexToDelete) {
    ws.spliceRows(rowIndexToDelete, 1);
    await saveWorkbook(wb);
    return true;
  }
  return false;
}

export async function publishReelToBiblioteca(id, finalLink = '') {
  const wb = await getWorkbook();
  const wsReels = wb.getWorksheet('Reels');
  const wsBib = wb.getWorksheet('Biblioteca');
  if (!wsReels) throw new Error('Aba Reels não encontrada');
  if (!wsBib) throw new Error('Aba Biblioteca não encontrada');

  let reelData = null;
  let reelRowIndex = null;

  wsReels.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (String(row.getCell(1).value || '').trim() === String(id).trim()) {
      reelRowIndex = rowNumber;
      reelData = {
        id: String(row.getCell(1).value || ''),
        tema: String(row.getCell(2).value || ''),
        gancho: String(row.getCell(3).value || ''),
        desenvolvimento: String(row.getCell(4).value || ''),
        cta: String(row.getCell(5).value || ''),
        tempoEstimado: String(row.getCell(6).value || ''),
        referenciaBiblica: String(row.getCell(7).value || ''),
        statusRoteiro: 'Publicado'
      };
    }
  });

  if (!reelData) throw new Error(`Roteiro de Reel ${id} não encontrado na planilha`);

  // Remove de Reels
  wsReels.spliceRows(reelRowIndex, 1);

  // Adiciona na aba Biblioteca
  const hojeIso = new Date().toISOString().slice(0, 10);
  const newRow = wsBib.addRow([
    reelData.id,
    reelData.tema,
    'Vídeo / Reels',
    hojeIso,
    finalLink || '',
    'Publicado no Instagram',
    reelData.gancho ? `Gancho: ${reelData.gancho}` : (reelData.desenvolvimento || '')
  ]);
  newRow.height = 20;
  newRow.eachCell(cell => {
    cell.font = { name: 'Calibri', size: 10 };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  });

  // Atualiza também em Planejamento caso conste lá
  const wsPlan = wb.getWorksheet('Planejamento');
  if (wsPlan) {
    wsPlan.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (String(row.getCell(1).value || '').trim() === String(id).trim()) {
        row.getCell(11).value = 'Publicado'; // Status
        if (finalLink) row.getCell(13).value = finalLink; // Link Instagram
      }
    });
  }

  await saveWorkbook(wb);
  return await getAllEditorialData();
}

export async function saveReelScript(reelData) {
  const wb = await getWorkbook();
  const ws = wb.getWorksheet('Reels');
  if (!ws) throw new Error('Aba Reels não encontrada');

  // Se o usuário marcou como 'Publicado', transfere automaticamente para a Biblioteca!
  if (reelData.statusRoteiro === 'Publicado' && reelData.id) {
    return await publishReelToBiblioteca(reelData.id, reelData.linkFinal || reelData.linkInstagram || '');
  }

  let targetRow = null;
  let maxIdNum = 0;
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cellId = String(row.getCell(1).value || '').trim();
    if (reelData.id && cellId === String(reelData.id).trim()) {
      targetRow = row;
    }
    const match = cellId.match(/ICR-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });

  const id = reelData.id || `ICR-${String(maxIdNum + 1).padStart(3, '0')}`;
  const values = [
    id,
    reelData.tema || '',
    reelData.gancho || '',
    reelData.desenvolvimento || '',
    reelData.cta || '',
    reelData.tempoEstimado || '60s',
    reelData.referenciaBiblica || '',
    reelData.statusRoteiro || 'Ideia'
  ];

  if (targetRow) {
    values.forEach((v, idx) => targetRow.getCell(idx + 1).value = v);
  } else {
    const newRow = ws.addRow(values);
    newRow.height = 20;
    newRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  }

  await saveWorkbook(wb);
  return { ...reelData, id };
}

export function getExcelFileBuffer() {
  return fs.readFileSync(EXCEL_PATH);
}

// === GERENCIAMENTO DE ESCALA DE EQUIPE ===

export async function saveOrUpdateEscala(escalaData) {
  const wb = await getWorkbook();
  let ws = wb.getWorksheet('Escala');
  if (!ws) {
    ws = wb.addWorksheet('Escala');
    const headers = ['ID', 'Data e Hora', 'Dia da Semana', 'Tipo de Data', 'Culto / Evento', 'Pessoa / Voluntário', 'Função / O que fará', 'Status', 'Observações'];
    const hRow = ws.addRow(headers);
    hRow.height = 24;
    hRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D695D' } };
    });
  }

  let targetRow = null;
  let maxIdNum = 0;

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cellId = String(row.getCell(1).value || '').trim();
    if (escalaData.id && cellId === String(escalaData.id).trim()) {
      targetRow = row;
    }
    const match = cellId.match(/ESC-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });

  const diasDaSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  let computedDiaSemana = escalaData.diaSemana || '';
  if (escalaData.data) {
    const rawDatePart = escalaData.data.split(' ')[0];
    const d = new Date(rawDatePart + 'T12:00:00');
    if (!isNaN(d.getTime())) {
      computedDiaSemana = diasDaSemana[d.getDay()];
    }
  }

  const id = escalaData.id || `ESC-${String(maxIdNum + 1).padStart(3, '0')}`;
  const values = [
    id,
    escalaData.data || '',
    computedDiaSemana,
    escalaData.tipoData || 'Data Fixa (Culto)',
    escalaData.evento || 'Culto de Celebração',
    escalaData.pessoa || 'Lucas Marques',
    escalaData.funcao || 'Fotografia',
    escalaData.status || 'Confirmado',
    escalaData.observacoes || ''
  ];

  if (targetRow) {
    values.forEach((v, idx) => targetRow.getCell(idx + 1).value = v);
  } else {
    const newRow = ws.addRow(values);
    newRow.height = 20;
    newRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  }

  await saveWorkbook(wb);
  return { ...escalaData, id, diaSemana: computedDiaSemana };
}

export async function deleteEscalaById(id) {
  const wb = await getWorkbook();
  const ws = wb.getWorksheet('Escala');
  if (!ws) return false;

  let rowIndexToDelete = null;
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    if (String(row.getCell(1).value || '').trim() === String(id).trim()) {
      rowIndexToDelete = rowNumber;
    }
  });

  if (rowIndexToDelete) {
    ws.spliceRows(rowIndexToDelete, 1);
    await saveWorkbook(wb);
    return true;
  }
  return false;
}

// Gera slots automáticos para os cultos de Terça (Ensino) e Domingo (Celebração) de um determinado mês
export async function generateCultosFixosEscala(ano, mes) {
  const wb = await getWorkbook();
  let ws = wb.getWorksheet('Escala');
  if (!ws) {
    await ensureEscalaWorksheet(wb);
    ws = wb.getWorksheet('Escala');
  }

  const targetAno = parseInt(ano, 10);
  const targetMes = parseInt(mes, 10); // 0 = Janeiro, 11 = Dezembro
  const totalDias = new Date(targetAno, targetMes + 1, 0).getDate();

  let maxIdNum = 0;
  const existingKeys = new Set();

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const cellId = String(row.getCell(1).value || '').trim();
    const cellData = String(row.getCell(2).value || '').trim();
    const cellFuncao = String(row.getCell(7).value || '').trim();
    const match = cellId.match(/ESC-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
    if (cellData && cellFuncao) {
      existingKeys.add(`${cellData}__${cellFuncao}`);
    }
  });

  const funcoesPadrao = ['Transmissão YouTube', 'Cobertura Stories', 'Fotografia', 'Projeção / Letras'];
  const novosSlots = [];

  for (let dia = 1; dia <= totalDias; dia++) {
    const curDate = new Date(targetAno, targetMes, dia, 12, 0, 0);
    const dayOfWeek = curDate.getDay(); // 0 = Domingo, 2 = Terça
    const diaFormatado = `${targetAno}-${String(targetMes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

    if (dayOfWeek === 2) {
      // Terça-feira: Culto de Ensino às 20:00
      const dataHora = `${diaFormatado} 20:00`;
      funcoesPadrao.forEach(funcao => {
        const key = `${dataHora}__${funcao}`;
        if (!existingKeys.has(key)) {
          maxIdNum++;
          novosSlots.push([
            `ESC-${String(maxIdNum).padStart(3, '0')}`,
            dataHora,
            'terça-feira',
            'Data Fixa (Culto)',
            'Culto de Ensino',
            'A Definir',
            funcao,
            'Pendente',
            'Culto fixo semanal da ICR - 20h'
          ]);
          existingKeys.add(key);
        }
      });
    } else if (dayOfWeek === 0) {
      // Domingo: Culto de Celebração (Manhã 10:00 e Noite 19:00)
      const dataHoraManha = `${diaFormatado} 10:00`;
      ['Transmissão YouTube', 'Cobertura Stories', 'Fotografia'].forEach(funcao => {
        const key = `${dataHoraManha}__${funcao}`;
        if (!existingKeys.has(key)) {
          maxIdNum++;
          novosSlots.push([
            `ESC-${String(maxIdNum).padStart(3, '0')}`,
            dataHoraManha,
            'domingo',
            'Data Fixa (Culto)',
            'Culto de Celebração (Manhã)',
            'A Definir',
            funcao,
            'Pendente',
            'Culto do Dia do Senhor (Manhã) - 10h'
          ]);
          existingKeys.add(key);
        }
      });

      const dataHoraNoite = `${diaFormatado} 19:00`;
      funcoesPadrao.forEach(funcao => {
        const key = `${dataHoraNoite}__${funcao}`;
        if (!existingKeys.has(key)) {
          maxIdNum++;
          novosSlots.push([
            `ESC-${String(maxIdNum).padStart(3, '0')}`,
            dataHoraNoite,
            'domingo',
            'Data Fixa (Culto)',
            'Culto de Celebração (Noite)',
            'A Definir',
            funcao,
            'Pendente',
            'Culto do Dia do Senhor (Noite) - 19h'
          ]);
          existingKeys.add(key);
        }
      });
    }
  }

  novosSlots.forEach(values => {
    const newRow = ws.addRow(values);
    newRow.height = 20;
    newRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  });

  await saveWorkbook(wb);
  return { success: true, gerados: novosSlots.length, total: ws.rowCount - 1 };
}

// Helpers para voluntários e funções na aba Setup
export async function addVoluntario(nome) {
  if (!nome) throw new Error('Nome do voluntário é obrigatório');
  return await addSetupOption('voluntarios', nome);
}

export async function removeVoluntario(nome) {
  if (!nome) throw new Error('Nome do voluntário é obrigatório');
  return await removeSetupOption('voluntarios', nome);
}

export async function addFuncaoEscala(funcao) {
  if (!funcao) throw new Error('Nome da função é obrigatório');
  return await addSetupOption('funcoesEscala', funcao);
}

export async function removeFuncaoEscala(funcao) {
  if (!funcao) throw new Error('Nome da função é obrigatório');
  return await removeSetupOption('funcoesEscala', funcao);
}


