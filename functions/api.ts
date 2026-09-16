import express from 'express';
import serverless from 'serverless-http';
import { dbManager } from '../server/db.js';

const app = express();
app.use(express.json());

// Forward requests identically to our database manager
app.get('/api/status', (req, res) => {
  res.json(dbManager.getDbStatus());
});

app.post('/api/check-device', (req, res) => {
  const { deviceId } = req.body;
  const result = dbManager.checkDeviceSession(deviceId);
  if (result.session) {
    result.session = dbManager.sanitizeSession(result.session) as any;
  }
  res.json(result);
});

app.post('/api/sessions/start', (req, res) => {
  const { deviceId, playerName, playerAge, mode } = req.body;
  const check = dbManager.checkDeviceSession(deviceId);
  if (check.locked) {
    return res.status(403).json({ error: 'Replay Locked', locked: true });
  }
  if (check.canResume && check.session) {
    return res.json({ session: dbManager.sanitizeSession(check.session), resumed: true });
  }
  const session = dbManager.createSession(deviceId, playerName, Number(playerAge) || 20, mode);
  res.json({ session: dbManager.sanitizeSession(session), resumed: false });
});

app.get('/api/sessions/:id', (req, res) => {
  const session = dbManager.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'Not found' });
  res.json(dbManager.sanitizeSession(session));
});

app.post('/api/sessions/:id/answer', (req, res) => {
  const { questionIndex, selectedIndex, deviceId } = req.body;
  try {
    const result = dbManager.submitAnswer(req.params.id, questionIndex, selectedIndex, deviceId);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/leaderboard', (req, res) => {
  const mode = req.query.mode as any;
  res.json(dbManager.getLeaderboard(mode));
});

export const handler = serverless(app);
