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
} from './excelService.js';
import {
  getInstagramConfig,
  saveInstagramConfig,
  getInstagramAccountOverview,
  syncAllInstagramMetrics,
  syncSinglePost
} from './instagramService.js';

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

export function excelDbPlugin() {
  return {
    name: 'excel-db-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const pathname = url.pathname;

        try {
          if (pathname === '/api/data' && req.method === 'GET') {
            const data = await getAllEditorialData();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }

          if (pathname === '/api/posts' && req.method === 'POST') {
            const body = await parseBody(req);
            const saved = await saveOrUpdatePost(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, post: saved }));
            return;
          }

          if (pathname.startsWith('/api/posts/') && req.method === 'DELETE') {
            const id = pathname.replace('/api/posts/', '');
            const success = await deletePostById(id);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success }));
            return;
          }

          if (pathname === '/api/setup' && req.method === 'POST') {
            const body = await parseBody(req);
            const updatedData = await addSetupOption(body.category, body.value);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, setup: updatedData.setup }));
            return;
          }

          if (pathname === '/api/setup' && req.method === 'DELETE') {
            const body = await parseBody(req);
            const updatedData = await removeSetupOption(body.category, body.value);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, setup: updatedData.setup }));
            return;
          }

          if (pathname === '/api/reels' && req.method === 'POST') {
            const body = await parseBody(req);
            const saved = await saveReelScript(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, reel: saved }));
            return;
          }

          if (pathname.startsWith('/api/reels/') && pathname.endsWith('/publish') && req.method === 'POST') {
            const id = pathname.replace('/api/reels/', '').replace('/publish', '');
            const body = await parseBody(req);
            const updated = await publishReelToBiblioteca(id, body.finalLink || body.linkInstagram || '');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, data: updated }));
            return;
          }

          if (pathname.startsWith('/api/reels/') && req.method === 'DELETE') {
            const id = pathname.replace('/api/reels/', '');
            const success = await deleteReelById(id);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success }));
            return;
          }

          if (pathname === '/api/download-excel' && req.method === 'GET') {
            const buf = getExcelFileBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="Database Controle Editorial.xlsx"');
            res.end(buf);
            return;
          }

          // === Endpoints Instagram ===
          if (pathname === '/api/instagram/status' && req.method === 'GET') {
            const overview = await getInstagramAccountOverview();
            const config = getInstagramConfig();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
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
            return;
          }

          if (pathname === '/api/instagram/sync' && req.method === 'POST') {
            const result = await syncAllInstagramMetrics();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result));
            return;
          }

          if (pathname.startsWith('/api/instagram/sync-post/') && req.method === 'POST') {
            const postId = pathname.replace('/api/instagram/sync-post/', '');
            const result = await syncSinglePost(postId);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, post: result }));
            return;
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
            res.end(JSON.stringify({
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
            return;
          }

          // === Endpoints Escala de Equipe ===
          if (pathname === '/api/escala' && req.method === 'POST') {
            const body = await parseBody(req);
            const saved = await saveOrUpdateEscala(body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, escala: saved }));
            return;
          }

          if (pathname === '/api/escala/gerar-fixos' && req.method === 'POST') {
            const body = await parseBody(req);
            const result = await generateCultosFixosEscala(body.ano, body.mes);
            const allData = await getAllEditorialData();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, ...result, escala: allData.escala }));
            return;
          }

          if (pathname === '/api/escala/voluntarios' && req.method === 'POST') {
            const body = await parseBody(req);
            const updated = await addVoluntario(body.nome);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, voluntarios: updated.setup.voluntarios }));
            return;
          }

          if (pathname === '/api/escala/voluntarios' && req.method === 'DELETE') {
            const body = await parseBody(req);
            const updated = await removeVoluntario(body.nome);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, voluntarios: updated.setup.voluntarios }));
            return;
          }

          if (pathname === '/api/escala/funcoes' && req.method === 'POST') {
            const body = await parseBody(req);
            const updated = await addFuncaoEscala(body.nome);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, funcoesEscala: updated.setup.funcoesEscala }));
            return;
          }

          if (pathname === '/api/escala/funcoes' && req.method === 'DELETE') {
            const body = await parseBody(req);
            const updated = await removeFuncaoEscala(body.nome);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, funcoesEscala: updated.setup.funcoesEscala }));
            return;
          }

          if (pathname.startsWith('/api/escala/') && !pathname.includes('voluntarios') && !pathname.includes('funcoes') && !pathname.includes('gerar-fixos') && req.method === 'DELETE') {
            const id = pathname.replace('/api/escala/', '');
            const success = await deleteEscalaById(id);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success }));
            return;
          }

          next();
        } catch (error) {
          console.error('Erro na API da planilha:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    }
  };
}
