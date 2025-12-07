class ApiClient {
  constructor(base) {
    this.base = base || process.env.GATEWAY_URL || 'http://localhost:8080';
  }

  async health() {
    const res = await fetch(this.base + '/');
    return await res.json();
  }

  async listUsers() {
    const res = await fetch(this.base + '/users');
    return await res.json();
  }

  async getUser(id) {
    const res = await fetch(`${this.base}/users/${id}`);
    return await res.json();
  }
}

export default ApiClient;
