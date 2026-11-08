// 링크나무 서버 - 외부 패키지 없이 Node.js 기본 모듈만 사용합니다.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');
const PUB = path.join(__dirname, 'public');

// ---------- 데이터 저장 (JSON 파일) ----------
const DEFAULT_DB = {
  profile: { name: '내 이름', bio: '한 줄 소개를 입력하세요', avatar: '' },
  links: [],
};

function loadDb() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}
function saveDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DATA_FILE); // 쓰는 도중 파일이 깨지지 않도록 교체 방식 사용
}
let db = loadDb();

// ---------- 유틸 ----------
function normalizeUrl(input) {
  let s = String(input || '').trim();
  if (!s) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null; // javascript: 등 차단
    return u.href;
  } catch {
    return null;
  }
}
function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
function send(res, status, body, headers = {}) {
  const isObj = typeof body === 'object' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(isObj ? JSON.stringify(body) : body);
}
function readJson(req, limit = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('too large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(new Error('bad json')); }
    });
    req.on('error', reject);
  });
}
function isAdmin(req) {
  const given = Buffer.from(String(req.headers['x-admin-password'] || ''));
  const real = Buffer.from(ADMIN_PASSWORD);
  return given.length === real.length && crypto.timingSafeEqual(given, real);
}
const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon',
};
function serveStatic(res, file) {
  const full = path.normalize(path.join(PUB, file));
  if (!full.startsWith(PUB + path.sep) && full !== PUB) return send(res, 403, 'Forbidden');
  fs.readFile(full, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    res.writeHead(200, { 'Content-Type': MIME[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
}

// ---------- 라우팅 ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  const m = req.method;

  try {
    // 공개 API: 프로필 + 링크 (실제 URL은 숨기고 /go/ID 로만 연결 → 클릭이 반드시 집계됨)
    if (m === 'GET' && p === '/api/page') {
      return send(res, 200, {
        profile: db.profile,
        links: db.links.map((l) => ({ id: l.id, title: l.title, host: hostOf(l.url) })),
      });
    }

    // 클릭 집계 후 이동
    if ((m === 'GET' || m === 'HEAD') && p.startsWith('/go/')) {
      const link = db.links.find((l) => l.id === p.slice(4));
      if (!link) return send(res, 404, '링크를 찾을 수 없습니다.');
      if (m === 'GET') {
        link.clicks = (link.clicks || 0) + 1;
        link.lastClickedAt = new Date().toISOString();
        saveDb();
      }
      res.writeHead(302, { Location: link.url, 'Cache-Control': 'no-store' });
      return res.end();
    }

    // 관리자 API
    if (p.startsWith('/api/admin')) {
      if (!isAdmin(req)) return send(res, 401, { error: '비밀번호가 올바르지 않습니다.' });

      if (m === 'GET' && p === '/api/admin/page') {
        return send(res, 200, db);
      }
      if (m === 'PUT' && p === '/api/admin/profile') {
        const b = await readJson(req, 1.5 * 1024 * 1024);
        const avatar = String(b.avatar || '');
        const okAvatar = avatar === '' || /^data:image\/(png|jpe?g|webp|gif);base64,/.test(avatar) || /^https?:\/\//.test(avatar);
        if (!okAvatar || avatar.length > 600000) return send(res, 400, { error: '프로필 사진 형식이 올바르지 않거나 너무 큽니다.' });
        db.profile = { name: clean(b.name, 40) || '이름 없음', bio: clean(b.bio, 100), avatar };
        saveDb();
        return send(res, 200, db.profile);
      }
      if (m === 'POST' && p === '/api/admin/links') {
        const b = await readJson(req);
        const u = normalizeUrl(b.url);
        const title = clean(b.title, 60);
        if (!title || !u) return send(res, 400, { error: '제목과 올바른 URL(http/https)을 입력하세요.' });
        const link = { id: crypto.randomBytes(4).toString('hex'), title, url: u, clicks: 0, createdAt: new Date().toISOString() };
        db.links.push(link);
        saveDb();
        return send(res, 201, link);
      }
      const lm = p.match(/^\/api\/admin\/links\/([a-f0-9]+)(\/(up|down))?$/);
      if (lm) {
        const idx = db.links.findIndex((l) => l.id === lm[1]);
        if (idx < 0) return send(res, 404, { error: '링크가 없습니다.' });
        if (m === 'PUT' && !lm[3]) {
          const b = await readJson(req);
          const u = normalizeUrl(b.url);
          const title = clean(b.title, 60);
          if (!title || !u) return send(res, 400, { error: '제목과 올바른 URL(http/https)을 입력하세요.' });
          db.links[idx].title = title;
          db.links[idx].url = u;
          saveDb();
          return send(res, 200, db.links[idx]);
        }
        if (m === 'DELETE' && !lm[3]) {
          db.links.splice(idx, 1);
          saveDb();
          return send(res, 200, { ok: true });
        }
        if (m === 'POST' && lm[3]) {
          const to = lm[3] === 'up' ? idx - 1 : idx + 1;
          if (to >= 0 && to < db.links.length) {
            [db.links[idx], db.links[to]] = [db.links[to], db.links[idx]];
            saveDb();
          }
          return send(res, 200, { ok: true });
        }
      }
      const rm = p.match(/^\/api\/admin\/links\/([a-f0-9]+)\/reset$/);
      if (m === 'POST' && rm) {
        const l = db.links.find((x) => x.id === rm[1]);
        if (!l) return send(res, 404, { error: '링크가 없습니다.' });
        l.clicks = 0;
        saveDb();
        return send(res, 200, l);
      }
      return send(res, 404, { error: 'Not found' });
    }

    // 화면
    if (m === 'GET') {
      if (p === '/') return serveStatic(res, 'index.html');
      if (p === '/admin') return serveStatic(res, 'admin.html');
      return serveStatic(res, p.slice(1));
    }
    send(res, 405, 'Method Not Allowed');
  } catch (e) {
    send(res, e.message === 'too large' ? 413 : 400, { error: e.message === 'too large' ? '데이터가 너무 큽니다.' : '잘못된 요청입니다.' });
  }
});

server.listen(PORT, () => {
  console.log(`링크나무 실행 중:  http://localhost:${PORT}`);
  console.log(`관리 페이지:       http://localhost:${PORT}/admin`);
  if (ADMIN_PASSWORD === 'admin1234') console.log('※ 기본 비밀번호(admin1234) 사용 중 - ADMIN_PASSWORD 환경변수로 바꾸세요.');
});
