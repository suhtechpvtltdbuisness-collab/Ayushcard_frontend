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
                // Refresh failed → tokens are unusable → force logout
                processQueue(refreshError, null);
                storage.clear();
                window.location.href = '/login';
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

    // ─── UTILITY ──────────────────────────────────────────────────────────

    logout: () => {
        storage.clear();
    },
};

export default apiService;
