// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    conversations: {
        list: `${API_BASE_URL}/api/conversations`,
        create: `${API_BASE_URL}/api/conversations`,
        get: (id: number) => `${API_BASE_URL}/api/conversations/${id}`,
        delete: (id: number) => `${API_BASE_URL}/api/conversations/${id}`,
        messages: (id: number) => `${API_BASE_URL}/api/conversations/${id}/messages`,
        saveMessage: (id: number) => `${API_BASE_URL}/api/conversations/${id}/messages`,
        domains: `${API_BASE_URL}/api/conversations/domains/list`,
    },
    chat: `${API_BASE_URL}/api/chat`,
    search: `${API_BASE_URL}/api/search`,
    summarize: `${API_BASE_URL}/api/summarize`,
    compare: `${API_BASE_URL}/api/compare/`,
    speech: {
        tts: `${API_BASE_URL}/api/speech/process-tts`,
        stt: `${API_BASE_URL}/api/speech/process-stt`
    }
};
