import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect } from "react";

export default function UserConnected({ children }) {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return !isCheckingAuth && authUser ? <Navigate to="/" /> : children;
}
