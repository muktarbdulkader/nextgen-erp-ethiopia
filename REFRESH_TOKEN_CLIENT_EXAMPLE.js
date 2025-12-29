// CLIENT-SIDE EXAMPLE: How to use refresh tokens
// This is a demonstration for your frontend implementation

class AuthManager {
    constructor() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        this.tokenExpiry = localStorage.getItem('tokenExpiry');
    }

    // Store tokens after login/register
    setTokens(accessToken, refreshToken, expiresIn) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;

        // Calculate expiry time (15 minutes from now)
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 15);
        this.tokenExpiry = expiryTime.toISOString();

        // Store in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('tokenExpiry', this.tokenExpiry);
    }

    // Check if token is about to expire (refresh if < 2 minutes left)
    async ensureValidToken() {
        if (!this.accessToken) return false;

        const now = new Date();
        const expiry = new Date(this.tokenExpiry);
        const timeUntilExpiry = expiry - now;

        // If token expires in less than 2 minutes, refresh it
        if (timeUntilExpiry < 2 * 60 * 1000) {
            return await this.refreshAccessToken();
        }

        return true;
    }

    // Refresh the access token
    async refreshAccessToken() {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: this.refreshToken
                })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();

            // Update tokens
            this.setTokens(data.accessToken, data.refreshToken, data.expiresIn);

            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            // Clear tokens and redirect to login
            this.logout();
            return false;
        }
    }

    // Make authenticated API calls with automatic token refresh
    async makeAuthenticatedRequest(url, options = {}) {
        // Ensure we have a valid token
        const isValid = await this.ensureValidToken();
        if (!isValid) {
            throw new Error('Authentication required');
        }

        // Add authorization header
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // If we get a 401, try to refresh and retry once
            if (response.status === 401) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    // Retry with new token
                    return fetch(url, {
                        ...options,
                        headers: {
                            ...headers,
                            'Authorization': `Bearer ${this.accessToken}`
                        }
                    });
                }
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Login
    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            this.setTokens(data.token, data.refreshToken, data.expiresIn);

            return data.user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Register
    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            this.setTokens(data.token, data.refreshToken, data.expiresIn);

            return data.user;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Logout
    async logout() {
        try {
            if (this.refreshToken) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refreshToken: this.refreshToken
                    })
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local tokens
            this.clearTokens();
        }
    }

    // Clear tokens from storage
    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.accessToken && !!this.refreshToken;
    }
}

// USAGE EXAMPLE:

// Initialize auth manager
const auth = new AuthManager();

// Example API call with automatic token refresh
async function fetchUserData() {
    try {
        const response = await auth.makeAuthenticatedRequest('/api/dashboard/stats');
        const data = await response.json();
        console.log('User data:', data);
        return data;
    } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Redirect to login if needed
        window.location.href = '/login';
    }
}

// Example login
async function handleLogin(email, password) {
    try {
        const user = await auth.login(email, password);
        console.log('Logged in user:', user);
        // Redirect to dashboard
        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Login failed:', error);
        // Show error message to user
    }
}

// Export for use in your app
// export default AuthManager;
