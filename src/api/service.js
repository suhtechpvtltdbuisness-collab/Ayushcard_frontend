import axios from 'axios';

// ─── AXIOS INSTANCE SETUP ──────────────────────────────────────────────────

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// ─── STORAGE HELPERS ───────────────────────────────────────────────────────

const storage = {
    // Read from both storages (login saves to either based on "keep me logged in")
    get: (key) => localStorage.getItem(key) || sessionStorage.getItem(key) || null,

    // Write to whichever storage was used during login
    set: (key, value) => {
        if (localStorage.getItem('token') !== null || localStorage.getItem('refreshToken') !== null) {
            localStorage.setItem(key, value);
        } else {
            sessionStorage.setItem(key, value);
        }
    },

    clear: () => {
        ['token', 'refreshToken', 'user'].forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    },
};

const getToken = () => storage.get('token');
const getRefreshToken = () => storage.get('refreshToken');

// ─── REFRESH TOKEN LOGIC ───────────────────────────────────────────────────

let isRefreshing = false;                // prevent multiple simultaneous refresh calls
let refreshQueue = [];                   // queue of failed requests awaiting new token

const processQueue = (error, newToken = null) => {
    refreshQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(newToken);
        }
    });
    refreshQueue = [];
};

const doRefresh = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    // Call the refresh endpoint — adjust URL if your backend differs
    const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
    );

    const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;
    const newRefreshToken = response.data?.data?.refreshToken || response.data?.refreshToken;

    if (!newAccessToken) throw new Error('Refresh response missing accessToken');

    // Save new tokens
    storage.set('token', newAccessToken);
    if (newRefreshToken) storage.set('refreshToken', newRefreshToken);

    return newAccessToken;
};

// ─── REQUEST INTERCEPTOR ───────────────────────────────────────────────────

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 and avoid retrying refresh calls themselves
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/api/auth/refresh-token')
        ) {
            // If no tokens at all → silent reject (user not logged in)
            if (!getToken() && !getRefreshToken()) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Another request is already refreshing — queue this one
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await doRefresh();
                processQueue(null, newToken);

                // Retry original failed request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed → tokens are unusable → fire auth:logout event
                // ProtectedRoute listens for this and navigates to /login via React Router.
                processQueue(refreshError, null);
                storage.clear();
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ─── API SERVICES ──────────────────────────────────────────────────────────

const apiService = {

    // ─── AUTH ─────────────────────────────────────────────────────────────

    // POST /api/auth/login
    login: async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        return response.data;
    },

    // POST /api/auth/refresh-token  (called automatically by interceptor, exposed if needed)
    refreshToken: async () => {
        const newToken = await doRefresh();
        return newToken;
    },

    // ─── USER ─────────────────────────────────────────────────────────────

    // GET /api/users/profile
    getProfile: async () => {
        const response = await api.get('/api/users/profile');
        if (import.meta.env.DEV) {
            console.log('[getProfile] raw response:', response.data);
        }
        return response.data;
    },

    // GET /api/users
    getEmployees: async () => {
        const response = await api.get('/api/users');
        return response.data;
    },

    // POST /api/users
    createEmployee: async (employeeData) => {
        const response = await api.post('/api/users', employeeData);
        return response.data;
    },

    // PUT /api/users/employee/:userId
    updateEmployee: async (userId, employeeData) => {
        const response = await api.put(`/api/users/employee/${userId}`, employeeData);
        return response.data;
    },

    // DELETE /api/users/:id
    deleteEmployee: async (id) => {
        const response = await api.delete(`/api/users/${id}`);
        return response.data;
    },

    // ─── HEALTH CARDS ─────────────────────────────────────────────────────

    // POST /api/cards
    createHealthCard: async (cardData, file = null) => {
        if (file) {
            const form = new FormData();
            Object.keys(cardData).forEach((key) => {
                if (key === 'members' && Array.isArray(cardData[key])) {
                    // Backend expects form-data arrays explicitly formatted for multipart
                    cardData[key].forEach((member, index) => {
                        if (member.name) form.append(`members[${index}][name]`, member.name);
                        if (member.relation) form.append(`members[${index}][relation]`, member.relation);
                        if (member.age) form.append(`members[${index}][age]`, member.age);
                    });
                } else if (typeof cardData[key] === 'object' && cardData[key] !== null) {
                    form.append(key, JSON.stringify(cardData[key]));
                } else {
                    form.append(key, cardData[key]);
                }
            });
            form.append('documents', file);
            const response = await api.post('/api/cards', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }
        const response = await api.post('/api/cards', cardData);
        return response.data;
    },

    // GET /api/cards
    getHealthCards: async () => {
        const response = await api.get('/api/cards');
        return response.data;
    },

    // GET /api/cards/:id
    getHealthCardById: async (id) => {
        const response = await api.get(`/api/cards/${id}`);
        return response.data;
    },

    // GET /api/cards?cardNo=:cardNo  (public QR verify lookup by card number)
    getHealthCardByCardNo: async (cardNo) => {
        const response = await api.get(`/api/cards?cardNo=${encodeURIComponent(cardNo)}`);
        return response.data;
    },

    // PUT /api/cards/:id
    updateHealthCard: async (id, cardData, file = null) => {
        if (file) {
            const form = new FormData();
            Object.keys(cardData).forEach((key) => {
                if (key === 'members' && Array.isArray(cardData[key])) {
                    // Revert to indexed fields for multipart updates
                    cardData[key].forEach((member, index) => {
                        if (member.name) form.append(`members[${index}][name]`, member.name);
                        if (member.relation) form.append(`members[${index}][relation]`, member.relation);
                        if (member.age) form.append(`members[${index}][age]`, member.age);
                    });
                } else if (typeof cardData[key] === 'object' && cardData[key] !== null) {
                    form.append(key, JSON.stringify(cardData[key]));
                } else {
                    form.append(key, cardData[key]);
                }
            });
            form.append('documents', file); // Append binary under 'documents' field
            const response = await api.put(`/api/cards/${id}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }
        const response = await api.put(`/api/cards/${id}`, cardData);
        return response.data;
    },

    // PATCH /api/cards/:id/status  (status-only update)
    updateHealthCardStatus: async (id, status) => {
        const response = await api.patch(`/api/cards/${id}/status`, { status });
        return response.data;
    },

    // DELETE /api/cards/:id
    deleteHealthCard: async (id) => {
        const response = await api.delete(`/api/cards/${id}`);
        return response.data;
    },

    // ─── CARD MEMBERS ─────────────────────────────────────────────────────

    // GET /api/card-members/card/:cardId
    getCardMembers: async (cardId) => {
        const response = await api.get(`/api/card-members/card/${cardId}`);
        return response.data;
    },

    // ─── ORGANIZATIONS ────────────────────────────────────────────────────

    // POST /api/organizations
    createOrganization: async (orgData) => {
        const response = await api.post('/api/organizations', orgData);
        return response.data;
    },

    // GET /api/organizations
    getOrganizations: async () => {
        const response = await api.get('/api/organizations');
        return response.data;
    },

    // GET /api/organizations/:id
    getOrganizationById: async (id) => {
        const response = await api.get(`/api/organizations/${id}`);
        return response.data;
    },

    // PUT /api/organizations/:id
    updateOrganization: async (id, orgData) => {
        const response = await api.put(`/api/organizations/${id}`, orgData);
        return response.data;
    },

    // DELETE /api/organizations/:id
    deleteOrganization: async (id) => {
        const response = await api.delete(`/api/organizations/${id}`);
        return response.data;
    },

    // ─── DOCTORS ──────────────────────────────────────────────────────────

    // POST /api/doctors
    // Body: { name, specialty, timeFrom, timeTo, location, organizationId, days[] }
    createDoctor: async (doctorData) => {
        const response = await api.post('/api/doctors/', doctorData);
        return response.data;
    },

    // GET /api/doctors/organization/:organizationId
    getDoctors: async (organizationId) => {
        const url = organizationId
            ? `/api/doctors/organization/${organizationId}`
            : '/api/doctors';
        const response = await api.get(url);
        return response.data;
    },

    // PUT /api/doctors/:id
    updateDoctor: async (id, doctorData) => {
        const response = await api.put(`/api/doctors/${id}`, doctorData);
        return response.data;
    },

    // DELETE /api/doctors/:id
    deleteDoctor: async (id) => {
        const response = await api.delete(`/api/doctors/${id}`);
        return response.data;
    },

    // ─── SALARIES ─────────────────────────────────────────────────────────

    // POST /api/salaries
    createSalary: async (salaryData) => {
        const response = await api.post('/api/salaries', salaryData);
        return response.data;
    },

    // ─── UTILITY ──────────────────────────────────────────────────────────

    logout: () => {
        storage.clear();
    },
};

export default apiService;
