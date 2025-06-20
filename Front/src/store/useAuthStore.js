import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useChatStore } from "./useChatStore";
import { io } from "socket.io-client";

const BASE_SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in check auth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (dataOfTheForm) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", dataOfTheForm);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Account created successfully");
    } catch (error) {
      console.log("Error in signup", error);
      toast.error("Error in signup");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (dataOfTheForm) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", dataOfTheForm);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Logged in successfully");
    } catch (error) {
      console.log("Error in login", error);
      toast.error("Error in login");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      useChatStore.getState().setSelectedUser(null);
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Error in logout", error);
      toast.error("Error in logout");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in update profile", error);
      toast.error("Error in update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_SOCKET_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket: socket });

    socket.on("connect", () => {
      console.log(
        "[SOCKET] Connected with id:",
        socket.id,
        "as user:",
        authUser._id
      );
      window.socket = socket;
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    console.log(
      "[SOCKET] Registering friend_request_received handler on socket",
      socket.id
    );
    socket.on("friend_request_received", (data) => {
      console.log("[SOCKET] Received friend_request_received event", data);
      // ...
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
