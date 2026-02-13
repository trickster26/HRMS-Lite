const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        const error = new Error(data.error || 'Something went wrong');
        error.details = data.details || [];
        error.status = response.status;
        throw error;
    }

    return data;
}

// Employee APIs
export const employeeApi = {
    getAll: () => request('/employees'),
    getOne: (employeeId) => request(`/employees/${employeeId}`),
    create: (data) => request('/employees', { method: 'POST', body: data }),
    delete: (employeeId) => request(`/employees/${employeeId}`, { method: 'DELETE' }),
};

// Attendance APIs
export const attendanceApi = {
    getByEmployee: (employeeId, params = {}) => {
        const query = new URLSearchParams(params).toString();
        const qs = query ? `?${query}` : '';
        return request(`/attendance/${employeeId}${qs}`);
    },
    getSummary: (employeeId) => request(`/attendance/summary/${employeeId}`),
    mark: (data) => request('/attendance', { method: 'POST', body: data }),
};

// Dashboard APIs
export const dashboardApi = {
    getSummary: () => request('/dashboard/summary'),
};
