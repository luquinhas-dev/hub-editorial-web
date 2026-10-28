import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  getAllEditorialData, 
  saveOrUpdatePost, 
  deletePostById, 
  saveReelScript, 
  deleteReelById,
  publishReelToBiblioteca,
  getExcelFileBuffer,
  addSetupOption,
  removeSetupOption,
  saveOrUpdateEscala,
  deleteEscalaById,
  generateCultosFixosEscala,
  addVoluntario,
  removeVoluntario,
  addFuncaoEscala,
  removeFuncaoEscala
} from './src/server/excelService.js';
import {
  getInstagramConfig,
  saveInstagramConfig,
  getInstagramAccountOverview,
  syncAllInstagramMetrics,
  syncSinglePost
} from './src/server/instagramService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5173;
const DIST_DIR = path.join(__dirname, 'dist');

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    if (pathname === '/api/data' && req.method === 'GET') {
      const data = await getAllEditorialData();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(data));
    }

    if (pathname === '/api/posts' && req.method === 'POST') {
      const body = await parseBody(req);
      const saved = await saveOrUpdatePost(body);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, post: saved }));
    }

    if (pathname.startsWith('/api/posts/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/posts/', '');
      const success = await deletePostById(id);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success }));
    }

    if (pathname === '/api/setup' && req.method === 'POST') {
      const body = await parseBody(req);
      const updatedData = await addSetupOption(body.category, body.value);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, setup: updatedData.setup }));
    }

    if (pathname === '/api/setup' && req.method === 'DELETE') {
      const body = await parseBody(req);
      const updatedData = await removeSetupOption(body.category, body.value);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, setup: updatedData.setup }));
    }

    if (pathname === '/api/reels' && req.method === 'POST') {
      const body = await parseBody(req);
      const saved = await saveReelScript(body);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, reel: saved }));
    }

    if (pathname.startsWith('/api/reels/') && pathname.endsWith('/publish') && req.method === 'POST') {
      const id = pathname.replace('/api/reels/', '').replace('/publish', '');
      const body = await parseBody(req);
      const updated = await publishReelToBiblioteca(id, body.finalLink || body.linkInstagram || '');
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, data: updated }));
    }

    if (pathname.startsWith('/api/reels/') && req.method === 'DELETE') {
      const id = pathname.replace('/api/reels/', '');
      const success = await deleteReelById(id);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success }));
    }

    if (pathname === '/api/download-excel' && req.method === 'GET') {
      const buf = getExcelFileBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="Database Controle Editorial.xlsx"');
      return res.end(buf);
    }

    // === Endpoints Instagram ===
    if (pathname === '/api/instagram/status' && req.method === 'GET') {
      const overview = await getInstagramAccountOverview();
      const config = getInstagramConfig();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ 
        success: true, 
        overview, 
        config: {
          username: config.username,
          accountId: config.accountId,
          hasToken: Boolean(config.accessToken),
          autoSync: config.autoSync,
          lastSync: config.lastSync,
          liveMode: overview.isLiveMode
        } 
      }));
    }

    if (pathname === '/api/instagram/sync' && req.method === 'POST') {
      const result = await syncAllInstagramMetrics();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(result));
    }

    if (pathname.startsWith('/api/instagram/sync-post/') && req.method === 'POST') {
      const postId = pathname.replace('/api/instagram/sync-post/', '');
      const result = await syncSinglePost(postId);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, post: result }));
    }

    if (pathname === '/api/instagram/config' && req.method === 'POST') {
      const body = await parseBody(req);
      const saved = saveInstagramConfig({
        username: body.username,
        accountId: body.accountId,
        accessToken: body.accessToken !== undefined ? body.accessToken : undefined,
        autoSync: body.autoSync
      });
      const overview = await getInstagramAccountOverview();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        overview,
        config: {
          username: saved.username,
          accountId: saved.accountId,
          hasToken: Boolean(saved.accessToken),
          autoSync: saved.autoSync,
          lastSync: saved.lastSync,
          liveMode: overview.isLiveMode
        }
      }));
    }

    // === Endpoints Escala de Equipe ===
    if (pathname === '/api/escala' && req.method === 'POST') {
      const body = await parseBody(req);
      const saved = await saveOrUpdateEscala(body);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, escala: saved }));
    }

    if (pathname === '/api/escala/gerar-fixos' && req.method === 'POST') {
      const body = await parseBody(req);
      const result = await generateCultosFixosEscala(body.ano, body.mes);
      const allData = await getAllEditorialData();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, ...result, escala: allData.escala }));
    }

    if (pathname === '/api/escala/voluntarios' && req.method === 'POST') {
      const body = await parseBody(req);
      const updated = await addVoluntario(body.nome);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, voluntarios: updated.setup.voluntarios }));
    }

    if (pathname === '/api/escala/voluntarios' && req.method === 'DELETE') {
      const body = await parseBody(req);
      const updated = await removeVoluntario(body.nome);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, voluntarios: updated.setup.voluntarios }));
    }

    if (pathname === '/api/escala/funcoes' && req.method === 'POST') {
      const body = await parseBody(req);
      const updated = await addFuncaoEscala(body.nome);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, funcoesEscala: updated.setup.funcoesEscala }));
    }

    if (pathname === '/api/escala/funcoes' && req.method === 'DELETE') {
      const body = await parseBody(req);
      const updated = await removeFuncaoEscala(body.nome);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, funcoesEscala: updated.setup.funcoesEscala }));
    }

    if (pathname.startsWith('/api/escala/') && !pathname.includes('voluntarios') && !pathname.includes('funcoes') && !pathname.includes('gerar-fixos') && req.method === 'DELETE') {
      const id = pathname.replace('/api/escala/', '');
      const success = await deleteEscalaById(id);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success }));
    }

    // Static file serving from dist if built
    let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath);
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'text/plain');
      return fs.createReadStream(filePath).pipe(res);
    }

    res.statusCode = 404;
    res.end('Not Found');
  } catch (error) {
    console.error('Server error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Hub Editorial Web rodando em http://localhost:${PORT}`);
});
