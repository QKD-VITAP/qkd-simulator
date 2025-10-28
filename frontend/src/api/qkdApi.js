// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Check for environment variables first
  if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
    const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
      return envUrl;
    }
  }
  
  // Check if we're in production (not localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If not localhost, assume we're in production and use the same domain
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${window.location.protocol}//${hostname}:8000`;
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

class QKDApi {
  constructor() {
    this.baseURL = (API_BASE_URL || '').replace(/\/$/, '');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getStatus() {
    return this.request('/');
  }

  async runSimulation(parameters) {
    return this.request('/simulate/bb84', {
      method: 'POST',
      body: JSON.stringify(parameters),
    });
  }

  async runSimulationAsync(parameters) {
    return this.request('/simulate/bb84/async', {
      method: 'POST',
      body: JSON.stringify(parameters),
    });
  }

  async getSimulationStatus(simulationId) {
    return this.request(`/simulate/status/${simulationId}`);
  }

  async getSimulationHistory() {
    return this.request('/simulate/history');
  }

  async runParameterSweep(request) {
    return this.request('/simulate/parameter-sweep', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getQBERMetrics() {
    return this.request('/metrics/qber');
  }

  async simulateAttack(request) {
    return this.request('/attack/simulate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getDashboardData() {
    return this.request('/dashboard/data');
  }

  async getSimulatorStatistics() {
    return this.request('/simulator/statistics');
  }

  async clearHistory() {
    return this.request('/simulator/clear-history', {
      method: 'DELETE',
    });
  }

  async runAdvancedReconciliation(simulationId, method = 'cascade') {
    return this.request(`/advanced/reconciliation?simulation_id=${encodeURIComponent(simulationId)}&method=${encodeURIComponent(method)}`, {
      method: 'POST',
    });
  }

  async runAdvancedPrivacyAmplification(simulationId, method = 'toeplitz') {
    return this.request(`/advanced/privacy-amplification?simulation_id=${encodeURIComponent(simulationId)}&method=${encodeURIComponent(method)}`, {
      method: 'POST',
    });
  }

  async runDecoyStateSimulation(simulationId, decoyParameters = {}) {
    return this.request(`/advanced/decoy-states?simulation_id=${encodeURIComponent(simulationId)}`, {
      method: 'POST',
      body: JSON.stringify(decoyParameters),
    });
  }

  async optimizeDecoyStates(targetDistance = 50.0, channelLoss = 0.2) {
    return this.request(`/advanced/optimize-decoy-states?target_distance=${targetDistance}&channel_loss=${channelLoss}`);
  }

  async createSecureCommunicationDemo(simulationId, encryptionMode = 'GCM', keyLength = 256) {
    return this.request(`/secure-communication/create-demo?simulation_id=${encodeURIComponent(simulationId)}&encryption_mode=${encodeURIComponent(encryptionMode)}&key_length=${encodeURIComponent(keyLength)}`, {
      method: 'POST',
    });
  }

  async runSecureCommunicationDemo(messages) {
    return this.request('/secure-communication/run-demo', {
      method: 'POST',
      body: JSON.stringify(messages),
    });
  }

  async getSecureCommunicationStats() {
    return this.request('/secure-communication/stats');
  }

  async exportSecureCommunicationLog(filepath) {
    return this.request('/secure-communication/export-log', {
      method: 'POST',
      body: JSON.stringify({ filepath }),
    });
  }

  async testConnection() {
    try {
      await this.getStatus();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  async generateQuantumKey(userId, keyLength = 256) {
    return this.request(`/messaging/keys/generate?user_id=${encodeURIComponent(userId)}&key_length=${keyLength}`);
  }

  async getUserQuantumKey(userId) {
    return this.request(`/messaging/keys/${encodeURIComponent(userId)}`);
  }

  async sendSecureMessage({ sender_id, receiver_id, message, encryption_mode = 'GCM', key_length = 256 }) {
    return this.request('/messaging/send', {
      method: 'POST',
      body: JSON.stringify({
        sender_id,
        receiver_id,
        message,
        encryption_mode,
        key_length
      })
    });
  }

  async receiveSecureMessage({ receiver_id, message_id }) {
    return this.request('/messaging/receive', {
      method: 'POST',
      body: JSON.stringify({
        receiver_id,
        message_id
      })
    });
  }

  async refreshQuantumKey(userId, keyLength = 256) {
    return this.request(`/messaging/keys/${encodeURIComponent(userId)}/refresh?key_length=${keyLength}`, {
      method: 'POST',
    });
  }

  async generateSharedQuantumKey({ user1_id, user2_id, key_length = 256 }) {
    return this.request('/messaging/keys/shared/generate', {
      method: 'POST',
      body: JSON.stringify({
        user1_id,
        user2_id,
        key_length
      })
    });
  }

  async getQuantumKeyStatistics() {
    return this.request('/messaging/keys/statistics');
  }

  async getMessagingStatistics() {
    return this.request('/messaging/statistics');
  }

  async getUserMessages(userId, messageType = 'all') {
    return this.request(`/messaging/messages/${encodeURIComponent(userId)}?message_type=${messageType}`);
  }

  async getMessageDetails(messageId, userId) {
    return this.request(`/messaging/messages/${encodeURIComponent(messageId)}/details?user_id=${encodeURIComponent(userId)}`);
  }

  async clearExpiredMessages(maxAgeHours = 24) {
    return this.request(`/messaging/clear-expired?max_age_hours=${maxAgeHours}`, {
      method: 'DELETE',
    });
  }
}

const qkdApi = new QKDApi();
export default qkdApi;
