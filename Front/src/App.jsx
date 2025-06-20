import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { setupChatSocketListeners } from "./store/useChatStore";

function App() {
  const { socket } = useAuthStore();

  useEffect(() => {
    if (socket) setupChatSocketListeners();
  }, [socket]);

  return (
    <>
      <div>
        <NavBar />
        <Outlet />
      </div>
      <Toaster />
    </>
  );
}

export default App;
