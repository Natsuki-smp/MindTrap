import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { dbManager } from './server/db.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Simple admin token cache
const ADMIN_PASS = 'plmokn098!?';
const validTokens = new Set<string>();

function generateAdminToken(): string {
  const token = 'adm_' + crypto.randomBytes(24).toString('hex');
  validTokens.add(token);
  return token;
}

function verifyAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: 'รหัสหรือโทเคนสิทธิ์ Admin ไม่ถูกต้อง' });
  }
  next();
}

// --- Public API Routes ---

// Health & Database Connection status
app.get('/api/status', (req, res) => {
  const status = dbManager.getDbStatus();
  res.json(status);
});

// Device status check (Replay Lock / Active Resume)
app.post('/api/check-device', (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) {
    return res.status(400).json({ error: 'Device ID is required' });
  }
  const result = dbManager.checkDeviceSession(deviceId);
  if (result.session) {
    result.session = dbManager.sanitizeSession(result.session) as any;
  }
  res.json(result);
});

// Start new game session
app.post('/api/sessions/start', (req, res) => {
  const { deviceId, playerName, playerAge, mode } = req.body;
  if (!deviceId || !playerName) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อและรหัสอุปกรณ์' });
  }
  if (mode !== 'HARD' && mode !== 'EXTREME') {
    return res.status(400).json({ error: 'โหมดต้องเป็น HARD หรือ EXTREME' });
  }

  // Double-check replay lock
  const check = dbManager.checkDeviceSession(deviceId);
  if (check.locked) {
    return res.status(403).json({
      error: 'คุณเคยทำแบบทดสอบจบแล้วบนอุปกรณ์นี้ ไม่สามารถเล่นซ้ำได้ (Replay Locked)',
      locked: true,
      previousSession: check.session ? dbManager.sanitizeSession(check.session) : null
    });
  }

  // If already active session exists, resume it instead
  if (check.canResume && check.session) {
    return res.json({
      session: dbManager.sanitizeSession(check.session),
      resumed: true
    });
  }

  try {
    const session = dbManager.createSession(deviceId, playerName, Number(playerAge) || 20, mode);
    res.json({
      session: dbManager.sanitizeSession(session),
      resumed: false
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการเริ่มเกม' });
  }
});

// Get session for resume
app.get('/api/sessions/:id', (req, res) => {
  const session = dbManager.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'ไม่พบเซสชัน' });
  }
  res.json(dbManager.sanitizeSession(session));
});

// Submit answer for current question
app.post('/api/sessions/:id/answer', (req, res) => {
  const { questionIndex, selectedIndex, deviceId } = req.body;
  if (typeof questionIndex !== 'number' || typeof selectedIndex !== 'number' || !deviceId) {
    return res.status(400).json({ error: 'ข้อมูลคำตอบไม่ครบถ้วน' });
  }

  try {
    const result = dbManager.submitAnswer(req.params.id, questionIndex, selectedIndex, deviceId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'ตอบคำถามไม่สำเร็จ' });
  }
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  const mode = req.query.mode as any;
  const list = dbManager.getLeaderboard(mode);
  res.json(list);
});

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASS) {
    const token = generateAdminToken();
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, error: 'รหัสผ่าน Admin ไม่ถูกต้อง' });
});

// --- Protected Admin Routes ---
app.get('/api/admin/db-status', verifyAdmin, (req, res) => {
  res.json(dbManager.getDbStatus());
});

app.get('/api/admin/questions', verifyAdmin, (req, res) => {
  const mode = req.query.mode as any;
  res.json(dbManager.getAllQuestions(mode));
});

app.post('/api/admin/questions', verifyAdmin, (req, res) => {
  const q = req.body;
  if (!q.id || !q.question || !Array.isArray(q.options) || q.options.length !== 4) {
    return res.status(400).json({ error: 'รูปแบบคำถามไม่ถูกต้อง' });
  }
  const result = dbManager.saveQuestion(q);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true });
});

app.put('/api/admin/questions/:id', verifyAdmin, (req, res) => {
  const q = req.body;
  q.id = req.params.id;
  const result = dbManager.saveQuestion(q);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true });
});

app.delete('/api/admin/questions/:id', verifyAdmin, (req, res) => {
  const ok = dbManager.deleteQuestion(req.params.id);
  res.json({ success: ok });
});

app.post('/api/admin/questions/generate', verifyAdmin, async (req, res) => {
  const { mode, count } = req.body;
  try {
    const added = await dbManager.autoGenerateQuestions(mode || 'HARD', Number(count) || 10);
    res.json({ success: true, added });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'สร้างคำถามไม่สำเร็จ' });
  }
});

app.get('/api/admin/questions/duplicates', verifyAdmin, (req, res) => {
  const dup = dbManager.checkDuplicates();
  res.json(dup);
});

app.get('/api/admin/sessions', verifyAdmin, (req, res) => {
  res.json(dbManager.getAllSessions());
});

app.delete('/api/admin/sessions/:id', verifyAdmin, (req, res) => {
  const ok = dbManager.deleteSession(req.params.id);
  res.json({ success: ok });
});

app.post('/api/admin/reset-device', verifyAdmin, (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'Device ID is required' });
  const ok = dbManager.resetDeviceSession(deviceId, true);
  res.json({ success: ok });
});

app.get('/api/admin/video-rewards', verifyAdmin, (req, res) => {
  res.json(dbManager.getVideoRewards());
});

app.post('/api/admin/video-rewards', verifyAdmin, (req, res) => {
  const rule = req.body;
  if (!rule.id || !rule.title || !rule.videoUrl || typeof rule.minScore !== 'number' || typeof rule.maxScore !== 'number') {
    return res.status(400).json({ error: 'ข้อมูลกฎวิดีโอไม่ครบถ้วน' });
  }
  const result = dbManager.saveVideoReward(rule);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true });
});

app.delete('/api/admin/video-rewards/:id', verifyAdmin, (req, res) => {
  const ok = dbManager.deleteVideoReward(req.params.id);
  res.json({ success: ok });
});

app.post('/api/admin/leaderboard/clear', verifyAdmin, (req, res) => {
  dbManager.clearLeaderboard();
  res.json({ success: true });
});

// --- Vite Middleware and Static Serving ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
