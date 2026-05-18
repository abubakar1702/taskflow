import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAuthStore from '../stores/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';


const buildUser = (apiUser) => ({
    id: apiUser.id,
    email: apiUser.email,
    name: `${apiUser.first_name} ${apiUser.last_name}`,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    avatar: apiUser.avatar,
});

const parseLoginError = (err) => {
    if (!err.response) return 'Network error. Please check your connection.';
    if (err.response.status === 401) return 'Invalid email or password.';
    return err.response.data?.detail || 'Login failed. Please try again.';
};

export const useRegister = () => {
    return useMutation({
        mutationFn: async ({ firstName, lastName, email, password }) => {
            const { data, status } = await axios.post(
                `${API_BASE_URL}/user/register/`,
                {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                },
                { withCredentials: true }
            );
            return { data, status };
        },
    });
};

export const useLogin = () => {
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, password }) => {
            const { data } = await axios.post(
                `${API_BASE_URL}/user/login/`,
                { email, password },
                { withCredentials: true }
            );
            return data;
        },
        onSuccess: (data, variables) => {
            if (data.action === 'OTP_REQUIRED') return;

            if (!data.access) throw new Error('Invalid response from server');

            setAuth({
                user: buildUser(data.user),
                accessToken: data.access,
                refreshToken: data.refresh,
                keepLoggedIn: variables.keepLoggedIn ?? false,
            });

            queryClient.clear();
            navigate('/', { replace: true });
        },
        onError: (err) => toast.error(parseLoginError(err)),
    });
};

export const useGoogleLogin = () => {
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credential) => {
            const { data } = await axios.post(
                `${API_BASE_URL}/user/auth/google/`,
                { token: credential },
                { withCredentials: true }
            );
            return data;
        },
        onSuccess: (data) => {
            if (data.action === 'OTP_REQUIRED') return;

            if (!data.access) throw new Error('Invalid response from server');

            setAuth({
                user: buildUser(data.user),
                accessToken: data.access,
                refreshToken: data.refresh,
                keepLoggedIn: true,
            });

            queryClient.clear();
            navigate('/', { replace: true });
        },
        onError: () => toast.error('Google login failed. Please try again.'),
    });
};

export const useVerifyOtp = () => {
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ email, otp, keepLoggedIn }) => {
            const { data } = await axios.post(
                `${API_BASE_URL}/user/verify-email/`,
                { email, otp },
                { withCredentials: true }
            );
            return { data, keepLoggedIn };
        },
        onSuccess: ({ data, keepLoggedIn }) => {
            if (!data.access) throw new Error('Invalid OTP response');

            setAuth({
                user: buildUser(data.user),
                accessToken: data.access,
                refreshToken: data.refresh,
                keepLoggedIn: keepLoggedIn ?? false,
            });

            queryClient.clear();
            navigate('/', { replace: true });
        },
        onError: (err) => {
            const msg = err.response?.data?.detail || 'Verification failed. Invalid OTP.';
            toast.error(msg);
        },
    });
};

export const useLogout = () => {
    const { clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => Promise.resolve(),
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            navigate('/login', { replace: true });
        },
    });
};
