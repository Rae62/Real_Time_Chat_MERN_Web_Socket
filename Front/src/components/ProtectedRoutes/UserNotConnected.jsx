import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader } from "lucide-react";
import { useEffect } from "react";

export default function UserNotConnected({ children }) {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    //   if (true) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return !isCheckingAuth && !authUser ? <Navigate to="/login" /> : children;
}
