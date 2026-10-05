const API_BASE = '/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  const customKey = localStorage.getItem('preppulse_gemini_key');
  if (customKey) {
    headers['x-gemini-key'] = customKey;
  }
  return headers;
};

export const api = {
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  async createInterview(data) {
    const customKey = localStorage.getItem('preppulse_gemini_key');
    const res = await fetch(`${API_BASE}/interviews/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...data, apiKey: customKey || undefined })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to initialize interview');
    }
    return await res.json();
  },

  async submitAnswer(id, { questionIndex, userAnswer, userCode }) {
    const customKey = localStorage.getItem('preppulse_gemini_key');
    const res = await fetch(`${API_BASE}/interviews/${id}/submit-answer`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questionIndex, userAnswer, userCode, apiKey: customKey || undefined })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit answer');
    }
    return await res.json();
  },

  async submitFollowUp(id, { questionIndex, followUpAnswer }) {
    const res = await fetch(`${API_BASE}/interviews/${id}/submit-followup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questionIndex, followUpAnswer })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit follow-up');
    }
    return await res.json();
  },

  async completeInterview(id, { durationMinutes }) {
    const customKey = localStorage.getItem('preppulse_gemini_key');
    const res = await fetch(`${API_BASE}/interviews/${id}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ durationMinutes, apiKey: customKey || undefined })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to evaluate interview');
    }
    return await res.json();
  },

  async getAllInterviews() {
    const res = await fetch(`${API_BASE}/interviews`);
    if (!res.ok) throw new Error('Failed to fetch interview history');
    return await res.json();
  },

  async getInterviewById(id) {
    const res = await fetch(`${API_BASE}/interviews/${id}`);
    if (!res.ok) throw new Error('Failed to fetch interview report');
    return await res.json();
  },

  async deleteInterview(id) {
    const res = await fetch(`${API_BASE}/interviews/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete interview');
    return await res.json();
  }
};
