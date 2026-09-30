/**
 * EYE OF ODIN - Lost & Found Item Tracker for Campus
 * Backend REST API Server (Zero external dependencies)
 * 
 * Run with: node server.js
 * Default Port: 5000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

let PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5050;
const DATA_DIR = path.join(__dirname, 'data');
const ITEMS_FILE = path.join(DATA_DIR, 'items.json');
const CLAIMS_FILE = path.join(DATA_DIR, 'claims.json');
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(ITEMS_FILE)) {
  fs.writeFileSync(ITEMS_FILE, '[]', 'utf8');
}

if (!fs.existsSync(CLAIMS_FILE)) {
  fs.writeFileSync(CLAIMS_FILE, '[]', 'utf8');
}

function readJsonFile(filePath, defaultVal = []) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return defaultVal;
  }
}

function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
    return false;
  }
}

// Read body helper
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5e6) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        if (!body) {
          resolve({});
        } else {
          resolve(JSON.parse(body));
        }
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Send JSON helper with CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

// Serve static file
function serveStaticFile(res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendJson(res, 404, { error: 'Not Found' });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // API ROUTING
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Health check
      if (pathname === '/api/health' && method === 'GET') {
        return sendJson(res, 200, {
          status: 'online',
          service: 'EYE OF ODIN Campus Lost & Found Tracker',
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        });
      }

      // 2. Stats
      if (pathname === '/api/stats' && method === 'GET') {
        const items = readJsonFile(ITEMS_FILE);
        const totalLost = items.filter(i => i.type === 'lost').length;
        const totalFound = items.filter(i => i.type === 'found').length;
        const totalReunited = items.filter(i => i.status === 'reunited').length;
        const inVault = items.filter(i => i.custody === 'security_locker').length;
        const criticalCount = items.filter(i => i.priority === 'critical' && i.status !== 'reunited').length;
        const totalActive = items.filter(i => i.status === 'active').length;
        const reunionRate = totalLost > 0 ? Math.min(96, Math.round((totalReunited / totalLost) * 100)) : 84;

        return sendJson(res, 200, {
          totalLost,
          totalFound,
          totalReunited,
          inVault,
          criticalCount,
          totalActive,
          reunionRate,
          timestamp: new Date().toISOString()
        });
      }

      // 3. GET /api/items (with query filters)
      if (pathname === '/api/items' && method === 'GET') {
        const items = readJsonFile(ITEMS_FILE);
        const query = parsedUrl.query;

        let filtered = [...items];

        if (query.type && query.type !== 'all') {
          filtered = filtered.filter(i => i.type === query.type);
        }
        if (query.category && query.category !== 'all') {
          filtered = filtered.filter(i => i.category === query.category);
        }
        if (query.priority && query.priority !== 'all') {
          filtered = filtered.filter(i => i.priority === query.priority);
        }
        if (query.buildingId && query.buildingId !== 'all') {
          filtered = filtered.filter(i => i.buildingId === query.buildingId);
        }
        if (query.status && query.status !== 'all') {
          if (query.status === 'in_vault') {
            filtered = filtered.filter(i => i.custody === 'security_locker');
          } else {
            filtered = filtered.filter(i => i.status === query.status);
          }
        }
        if (query.q) {
          const q = query.q.toLowerCase();
          filtered = filtered.filter(i => {
            const titleMatch = i.title && i.title.toLowerCase().includes(q);
            const descMatch = i.description && i.description.toLowerCase().includes(q);
            const tagMatch = i.tags && i.tags.some(t => t.toLowerCase().includes(q));
            const locMatch = i.specificLocation && i.specificLocation.toLowerCase().includes(q);
            const catMatch = i.customCategory && i.customCategory.toLowerCase().includes(q);
            return titleMatch || descMatch || tagMatch || locMatch || catMatch;
          });
        }

        return sendJson(res, 200, {
          count: filtered.length,
          total: items.length,
          items: filtered
        });
      }

      // 4. POST /api/items (Create new report)
      if (pathname === '/api/items' && method === 'POST') {
        const body = await parseRequestBody(req);

        if (!body.title || !body.type) {
          return sendJson(res, 400, {
            error: 'Missing required fields: title and type are required'
          });
        }

        const items = readJsonFile(ITEMS_FILE);
        const newItem = {
          id: `item-${body.type}-${Date.now()}`,
          type: body.type, // 'lost' or 'found'
          priority: body.priority || 'standard', // 'critical', 'high', 'standard'
          title: body.title,
          category: body.category || 'others',
          customCategory: body.customCategory || null,
          description: body.description || '',
          buildingId: body.buildingId || 'bldg-quad',
          specificLocation: body.specificLocation || 'Campus grounds',
          date: body.date || new Date().toISOString(),
          status: 'active',
          color: body.color || '#3b82f6',
          colorName: body.colorName || 'Default',
          rewardBounty: Number(body.rewardBounty) || 0,
          secretQuestion: body.secretQuestion || '',
          secretAnswerHint: body.secretAnswerHint || '',
          tags: Array.isArray(body.tags) ? body.tags : (body.tags ? [body.tags] : []),
          reporter: {
            name: (body.reporter && body.reporter.name) || 'Anonymous Student',
            role: (body.reporter && body.reporter.role) || 'Campus Member',
            email: (body.reporter && body.reporter.email) || '',
            verified: Boolean(body.reporter && body.reporter.verified)
          },
          custody: body.custody || 'self',
          viewsCount: 0,
          hasImage: Boolean(body.hasImage),
          previewType: body.previewType || 'cube'
        };

        items.unshift(newItem);
        writeJsonFile(ITEMS_FILE, items);

        return sendJson(res, 201, {
          success: true,
          message: 'Item registered in Odin registry',
          item: newItem
        });
      }

      // 5. GET /api/items/:id
      if (pathname.startsWith('/api/items/') && !pathname.includes('/status') && method === 'GET') {
        const id = pathname.replace('/api/items/', '');
        const items = readJsonFile(ITEMS_FILE);
        const item = items.find(i => i.id === id);

        if (!item) {
          return sendJson(res, 404, { error: `Item with id ${id} not found` });
        }

        return sendJson(res, 200, item);
      }

      // 6. PATCH /api/items/:id/status
      if (pathname.match(/^\/api\/items\/([^/]+)\/status$/) && method === 'PATCH') {
        const matches = pathname.match(/^\/api\/items\/([^/]+)\/status$/);
        const id = matches[1];
        const body = await parseRequestBody(req);

        const items = readJsonFile(ITEMS_FILE);
        const index = items.findIndex(i => i.id === id);

        if (index === -1) {
          return sendJson(res, 404, { error: `Item with id ${id} not found` });
        }

        if (body.status) items[index].status = body.status;
        if (body.custody) items[index].custody = body.custody;
        if (body.priority) items[index].priority = body.priority;

        writeJsonFile(ITEMS_FILE, items);

        return sendJson(res, 200, {
          success: true,
          message: 'Item status updated',
          item: items[index]
        });
      }

      // 7. POST /api/claims (Submit anti-scam ownership challenge)
      if (pathname === '/api/claims' && method === 'POST') {
        const body = await parseRequestBody(req);

        if (!body.itemId || !body.claimantName) {
          return sendJson(res, 400, { error: 'Missing required claim parameters' });
        }

        const claims = readJsonFile(CLAIMS_FILE);
        const newClaim = {
          id: `claim-${Date.now()}`,
          itemId: body.itemId,
          claimantName: body.claimantName,
          claimantEmail: body.claimantEmail || '',
          claimantPhone: body.claimantPhone || '',
          answerProvided: body.answerProvided || '',
          identifyingMarks: body.identifyingMarks || '',
          status: 'pending_verification',
          submittedAt: new Date().toISOString()
        };

        claims.unshift(newClaim);
        writeJsonFile(CLAIMS_FILE, claims);

        return sendJson(res, 201, {
          success: true,
          claimId: newClaim.id,
          message: 'Ownership claim submitted to security desk for verification.',
          claim: newClaim
        });
      }

      // 8. GET /api/claims
      if (pathname === '/api/claims' && method === 'GET') {
        const claims = readJsonFile(CLAIMS_FILE);
        return sendJson(res, 200, { count: claims.length, claims });
      }

      return sendJson(res, 404, { error: 'Unknown API endpoint' });
    } catch (err) {
      console.error('API Error:', err);
      return sendJson(res, 500, { error: 'Internal Server Error', message: err.message });
    }
  }

  // STATIC ASSET SERVING (Frontend fallback)
  if (fs.existsSync(FRONTEND_DIR)) {
    let reqPath = pathname;
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
    const fullPath = path.join(FRONTEND_DIR, safePath);

    fs.stat(fullPath, (err, stats) => {
      if (!err && stats.isFile()) {
        serveStaticFile(res, fullPath);
      } else {
        // If not found in frontend, send simple 404 or API info
        sendJson(res, 404, {
          error: 'File not found',
          tip: 'EYE OF ODIN REST API is running. Check /api/items or /api/health'
        });
      }
    });
  } else {
    // If frontend directory is not adjacent, provide welcome message
    sendJson(res, 200, {
      message: 'EYE OF ODIN Backend API Server is running.',
      endpoints: [
        'GET   /api/health',
        'GET   /api/stats',
        'GET   /api/items',
        'POST  /api/items',
        'GET   /api/items/:id',
        'PATCH /api/items/:id/status',
        'POST  /api/claims',
        'GET   /api/claims'
      ]
    });
  }
});

function startServer(port) {
  server.listen(port, () => {
    console.log('================================================================');
    console.log('[ODIN-CORE] EYE OF ODIN - Campus Lost & Found REST API Server');
    console.log('================================================================');
    console.log(`[STATUS]    ONLINE (Active Grid Protocol)`);
    console.log(`[NETWORK]   http://localhost:${port}`);
    console.log(`[ENDPOINTS]`);
    console.log(`   - GET   http://localhost:${port}/api/items`);
    console.log(`   - POST  http://localhost:${port}/api/items`);
    console.log(`   - GET   http://localhost:${port}/api/stats`);
    console.log(`   - POST  http://localhost:${port}/api/claims`);
    console.log(`   - GET   http://localhost:${port}/api/health`);
    console.log('----------------------------------------------------------------');
    console.log(`[FRONTEND]  Static UI automatically served at http://localhost:${port}`);
    console.log('================================================================');
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[PORT-CONFLICT] Port ${PORT} busy, cycling to port ${PORT + 1}...`);
    PORT += 1;
    startServer(PORT);
  } else {
    console.error('Server error:', err);
  }
});

startServer(PORT);

