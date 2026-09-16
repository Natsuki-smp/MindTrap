import { GameMode, PlayerSession, LeaderboardEntry, DbStatusInfo, VideoRewardRule, Question } from '../types.js';

class ApiClient {
  private getHeaders(token?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public async getStatus(): Promise<DbStatusInfo> {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('ไม่สามารถตรวจสอบสถานะฐานข้อมูลได้');
    return res.json();
  }

  public async checkDevice(deviceId: string): Promise<{
    canPlay: boolean;
    locked: boolean;
    canResume: boolean;
    session?: any;
    message?: string;
  }> {
    const res = await fetch('/api/check-device', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ deviceId })
    });
    if (!res.ok) throw new Error('ตรวจสอบสถานะอุปกรณ์ไม่สำเร็จ');
    return res.json();
  }

  public async startSession(deviceId: string, playerName: string, playerAge: number, mode: GameMode): Promise<{
    session: any;
    resumed: boolean;
  }> {
    const res = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ deviceId, playerName, playerAge, mode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'เริ่มเซสชันไม่สำเร็จ');
    return data;
  }

  public async getSession(sessionId: string): Promise<any> {
    const res = await fetch(`/api/sessions/${sessionId}`);
    if (!res.ok) throw new Error('ไม่พบข้อมูลเซสชัน');
    return res.json();
  }

  public async submitAnswer(sessionId: string, questionIndex: number, selectedIndex: number, deviceId: string): Promise<{
    answerRecord: any;
    session: any;
    isCompleted: boolean;
    videoReward: VideoRewardRule | null;
  }> {
    const res = await fetch(`/api/sessions/${sessionId}/answer`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ questionIndex, selectedIndex, deviceId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ส่งคำตอบไม่สำเร็จ');
    return data;
  }

  public async getLeaderboard(mode?: GameMode): Promise<LeaderboardEntry[]> {
    const url = mode ? `/api/leaderboard?mode=${mode}` : '/api/leaderboard';
    const res = await fetch(url);
    if (!res.ok) throw new Error('โหลดตารางคะแนนไม่สำเร็จ');
    return res.json();
  }

  // --- Admin Endpoints ---
  public async adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ password })
    });
    return res.json();
  }

  public async getAdminDbStatus(token: string): Promise<DbStatusInfo> {
    const res = await fetch('/api/admin/db-status', {
      headers: this.getHeaders(token)
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  }

  public async getAdminQuestions(token: string, mode?: GameMode): Promise<Question[]> {
    const url = mode ? `/api/admin/questions?mode=${mode}` : '/api/admin/questions';
    const res = await fetch(url, {
      headers: this.getHeaders(token)
    });
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  }

  public async saveAdminQuestion(token: string, question: Question): Promise<{ success: boolean; error?: string }> {
    const isEdit = Boolean(question.id && !question.id.startsWith('new_'));
    const url = isEdit ? `/api/admin/questions/${question.id}` : '/api/admin/questions';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: this.getHeaders(token),
      body: JSON.stringify(question)
    });
    return res.json();
  }

  public async deleteAdminQuestion(token: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token)
    });
    return res.json();
  }

  public async generateAdminQuestions(token: string, mode: GameMode, count: number): Promise<{ success: boolean; added: number }> {
    const res = await fetch('/api/admin/questions/generate', {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ mode, count })
    });
    return res.json();
  }

  public async checkAdminDuplicates(token: string): Promise<{ duplicates: any[]; uniqueCount: number }> {
    const res = await fetch('/api/admin/questions/duplicates', {
      headers: this.getHeaders(token)
    });
    return res.json();
  }

  public async getAdminSessions(token: string): Promise<PlayerSession[]> {
    const res = await fetch('/api/admin/sessions', {
      headers: this.getHeaders(token)
    });
    return res.json();
  }

  public async deleteAdminSession(token: string, sessionId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token)
    });
    return res.json();
  }

  public async resetAdminDevice(token: string, deviceId: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/reset-device', {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ deviceId })
    });
    return res.json();
  }

  public async getAdminVideoRewards(token: string): Promise<VideoRewardRule[]> {
    const res = await fetch('/api/admin/video-rewards', {
      headers: this.getHeaders(token)
    });
    return res.json();
  }

  public async saveAdminVideoReward(token: string, rule: VideoRewardRule): Promise<{ success: boolean; error?: string }> {
    const res = await fetch('/api/admin/video-rewards', {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(rule)
    });
    return res.json();
  }

  public async deleteAdminVideoReward(token: string, id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/video-rewards/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(token)
    });
    return res.json();
  }

  public async clearAdminLeaderboard(token: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/leaderboard/clear', {
      method: 'POST',
      headers: this.getHeaders(token)
    });
    return res.json();
  }
}

export const api = new ApiClient();
