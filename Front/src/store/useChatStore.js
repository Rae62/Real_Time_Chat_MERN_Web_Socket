import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false, // Retire la double déclaration de `isUsersLoading`
  isMessagesLoading: false,
  typingUserId: null, // ID of the user currently typing in the selected chat

  // Récupère les utilisateurs
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement des utilisateurs"
      );
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Marque les messages comme lus
  markMessagesAsRead: async (userId) => {
    try {
      await axiosInstance.post(`/message/read/${userId}`);
      // Optionally, refetch users to update unread counts
      get().getUsers();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour des messages lus"
      );
    }
  },

  // Récupère les messages d'un utilisateur
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Envoie un message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Définir l'utilisateur sélectionné
  setSelectedUser: (user) => set({ selectedUser: user }),
}));

// Real-time unread count updates and typing indicator
export const setupChatSocketListeners = () => {
  const socket = useAuthStore.getState().socket;
  if (socket) {
    socket.off("newMessage"); // Remove previous listener to avoid duplicates
    socket.on("newMessage", async (newMessage) => {
      const { selectedUser, messages, markMessagesAsRead } =
        useChatStore.getState();
      // If the message is for the currently selected chat, append it and mark as read
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        useChatStore.setState({ messages: [...messages, newMessage] });
        // Mark messages as read immediately
        await markMessagesAsRead(selectedUser._id);
      }
      // Always update users for unread counts
      useChatStore.getState().getUsers();
    });
    socket.on("user_unblocked", () => {
      useChatStore.getState().getUsers();
      window.dispatchEvent(new Event("refetchAllUsers"));
      if (window.refetchFriends) window.refetchFriends();
    });
    socket.on("user_blocked", () => {
      if (window.refetchFriends) window.refetchFriends();
    });
    // Typing indicator listeners
    socket.off("typing");
    socket.off("stop_typing");
    socket.on("typing", ({ from }) => {
      const { selectedUser } = useChatStore.getState();
      if (selectedUser && selectedUser._id === from) {
        useChatStore.setState({ typingUserId: from });
      }
    });
    socket.on("stop_typing", ({ from }) => {
      const { typingUserId } = useChatStore.getState();
      if (typingUserId === from) {
        useChatStore.setState({ typingUserId: null });
      }
    });
  }
};
