import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import { io } from 'socket.io-client';

const BaseURL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
            const res = await axiosInstance.get('/auth/check');
            set({ authUser: res.data, isCheckingAuth: false });
            // connect socket after auth succeeds
            get().connectSocket();
        } catch (error) {
            set({ authUser: null, isCheckingAuth: false });
            console.error('Error checking auth:', error);
        }
    },

    connectSocket: () => {
        const { authUser, socket } = get();
        if (socket) return; // already connected
        if (!authUser) return;

        const newSocket = io(BaseURL, {
            query: {
                userId: authUser._id,
            },
        });

        newSocket.on('getOnlineUsers', (users) => {
            set({ onlineUsers: users });
            console.log('Online users:', users);
        });

        set({ socket: newSocket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    signup: async (formData) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post('/auth/register', formData);
            set({ authUser: res.data });
            toast.success("Signup successful!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout');
            set({ authUser: null });
            toast.success("Logout successful!");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Logout failed");
        }

    },

    login: async (formData) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post('/auth/login', formData);
            set({ authUser: res.data })
            toast.success("Login successful!");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (updatedData) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put('/auth/update-profile-pic', updatedData);
            set({ authUser: res.data });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Profile update failed");
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
}));