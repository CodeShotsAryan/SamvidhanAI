// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    auth: {
        register: `${API_BASE_URL}/api/auth/register`,
        verifyEmail: `${API_BASE_URL}/api/auth/verify-otp`,
        resendVerification: `${API_BASE_URL}/api/auth/resend-verification`,
        login: `${API_BASE_URL}/api/auth/login`,
        me: `${API_BASE_URL}/api/auth/me`,
        forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
        resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
    },
    search: `${API_BASE_URL}/api/search`,
    summarize: `${API_BASE_URL}/api/summarize`,
    compare: `${API_BASE_URL}/api/compare`,
};
