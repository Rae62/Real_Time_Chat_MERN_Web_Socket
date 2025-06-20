import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const useUserStore = create((set, get) => ({
  users: [],
  allUsers: [],
  loading: false,
  error: null,
  pendingRequests: [], // Friend requests received
  friends: [], // Friend list
  sentRequests: [], // Friend requests sent

  getUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data.users, loading: false });
    } catch {
      set({ error: "Failed to load users", loading: false });
    }
  },

  addFriend: async (targetUserId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/friend/request", { targetUserId });
      await get().fetchSentRequests();
      set((state) => ({
        users: state.users.map((user) =>
          user._id === targetUserId ? { ...user, isPending: true } : user
        ),
        loading: false,
      }));
      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Error sending friend request",
      });
      return false;
    }
  },

  fetchPendingRequests: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/friend/requests");
      set({ pendingRequests: res.data.requests, loading: false });
    } catch {
      set({ error: "Failed to load friend requests", loading: false });
    }
  },

  fetchFriends: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/friend/list");
      // Exclude blocked users as a fallback
      const authUser = JSON.parse(localStorage.getItem("authUser"));
      const blocked = authUser?.blockedUsers || [];
      set({
        friends: res.data.friends.filter((f) => !blocked.includes(f._id)),
        loading: false,
      });
    } catch {
      set({ error: "Failed to load friends", loading: false });
    }
  },

  fetchSentRequests: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/friend/sent-requests");
      set({ sentRequests: res.data.sentRequests, loading: false });
    } catch {
      set({ error: "Failed to load sent friend requests", loading: false });
    }
  },

  acceptFriend: async (requesterId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/friend/accept", { requesterId });
      get().fetchPendingRequests();
      get().fetchFriends();
      get().fetchSentRequests();
      set({ loading: false });
      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Error accepting friend",
      });
      return false;
    }
  },

  declineFriend: async (requesterId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/friend/decline", { requesterId });
      get().fetchSentRequests();
      set({ loading: false });
      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Error declining friend",
      });
      return false;
    }
  },

  removeFriend: async (friendId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/friend/remove", { friendId });
      await get().fetchFriends();
      await get().getUsers();
      set({ loading: false });
      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Error removing friend",
      });
      return false;
    }
  },

  blockFriend: async (targetUserId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/friend/block", { targetUserId });
      // Update authUser in localStorage (fetch latest from backend if needed)
      const res = await axiosInstance.get("/auth/check");
      localStorage.setItem("authUser", JSON.stringify(res.data));
      await get().fetchFriends();
      set({ loading: false });
      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Error blocking user",
      });
      return false;
    }
  },

  unblockFriend: async (targetUserId) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/friend/unblock", { targetUserId });
      // Update authUser in localStorage
      const res = await axiosInstance.get("/auth/check");
      localStorage.setItem("authUser", JSON.stringify(res.data));
      await get().fetchFriends();
      set({ loading: false });
      return true;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Error unblocking user",
      });
      return false;
    }
  },

  getAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.get("/friend/all-users");
      set({ allUsers: res.data.users, loading: false });
    } catch {
      set({ error: "Failed to load all users", loading: false });
    }
  },
}));

// Fetch pending requests and sent requests on store initialization
useUserStore.getState().fetchPendingRequests();
useUserStore.getState().fetchSentRequests();

// Real-time socket listeners for friend requests and block/unblock events
const setupSocketListeners = () => {
  const { socket } = useAuthStore.getState();
  if (!socket) return;

  // Friend request received
  socket.on("friend_request_received", () => {
    useUserStore.getState().fetchPendingRequests();
    useUserStore.getState().fetchFriends();
    useUserStore.getState().fetchSentRequests();
    useUserStore.getState().getAllUsers();
    useUserStore.getState().getUsers();
    window.dispatchEvent(new Event("refetchAllUsers"));
  });

  // Friend request accepted
  socket.on("friend_request_accepted", () => {
    useUserStore.getState().fetchFriends();
    useUserStore.getState().getUsers();
    useUserStore.getState().fetchSentRequests();
    window.dispatchEvent(new Event("refetchAllUsers"));
  });

  // Friend request declined
  socket.on("friend_request_declined", () => {
    useUserStore.getState().fetchPendingRequests();
    useUserStore.getState().fetchFriends();
    useUserStore.getState().fetchSentRequests();
    useUserStore.getState().getAllUsers();
    useUserStore.getState().getUsers();
    window.dispatchEvent(new Event("refetchAllUsers"));
  });

  // Friend removed
  socket.on("friend_removed", () => {
    useUserStore.getState().fetchFriends();
    useUserStore.getState().getUsers();
    useUserStore.getState().fetchPendingRequests();
    useUserStore.getState().fetchSentRequests();
    window.dispatchEvent(new Event("refetchAllUsers"));
  });

  // User blocked
  socket.on("user_blocked", () => {
    useUserStore.getState().fetchFriends();
    useUserStore.getState().getUsers();
    useUserStore.getState().fetchPendingRequests();
    useUserStore.getState().fetchSentRequests();
    // Update authUser in localStorage
    axiosInstance.get("/auth/check").then((res) => {
      localStorage.setItem("authUser", JSON.stringify(res.data));
      window.dispatchEvent(new Event("refetchAllUsers"));
    });
  });

  // User unblocked
  socket.on("user_unblocked", () => {
    useUserStore.getState().fetchFriends();
    useUserStore.getState().getUsers();
    useUserStore.getState().fetchPendingRequests();
    useUserStore.getState().fetchSentRequests();
    // Update authUser in localStorage
    axiosInstance.get("/auth/check").then((res) => {
      localStorage.setItem("authUser", JSON.stringify(res.data));
      window.dispatchEvent(new Event("refetchAllUsers"));
    });
  });
};

// Setup listeners when socket is available
useAuthStore.subscribe(
  (state) => state.socket,
  (socket) => {
    if (socket) setupSocketListeners();
  }
);

export { useUserStore };
