import { create } from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';


export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    isUsersLoading: false,
    isMessagesLoading: false,
    selectedUser: null,


    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get('/message/users/sidebar');
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users");
            set({ isUsersLoading: false });
        } finally {
            set({ isUsersLoading: false });
        }
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            console.log(userId)
            const res = await axiosInstance.get(`/message/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    },


    subscribeToMessages: () => {
        const { selectedUser } = get();
        const { socket } = useAuthStore.getState();
        if (!socket || !selectedUser) return;
        socket.on("newMessage", (newMessage) => {
            if (newMessage.senderId === selectedUser._id) {
                set((state) => ({ messages: [...state.messages, newMessage] }));
            }
        });
    },

    unsubscribeFromMessages: () => {
        const { socket } = useAuthStore.getState();
        if (!socket) return;
        socket.off("newMessage");
    },


    setSelectedUser: (user) => {
        set({ selectedUser: user });
    },

    // optional convenience: clear selection
    clearSelectedUser: () => set({ selectedUser: null }),

    // subscribe/unsubscribe (simple polling fallback; replace with socket logic later)
    // subscribeToMessages: () => {
    //     const { selectedUser, getMessages, _messagePollId } = get();
    //     if (!selectedUser || !selectedUser._id) return;
    //     // avoid double subscription
    //     if (_messagePollId) return;
    //     const id = setInterval(() => {
    //         getMessages(selectedUser._id);
    //     }, 3000); // poll every 3s
    //     set({ _messagePollId: id });
    // },


}));