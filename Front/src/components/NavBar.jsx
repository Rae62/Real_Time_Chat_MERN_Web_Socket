import { useAuthStore } from "../store/useAuthStore";
import { useUserStore } from "../store/useUserStore";
import { Link } from "react-router-dom";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  Bell,
  Users,
} from "lucide-react";

export default function NavBar() {
  const { authUser, logout } = useAuthStore();
  const { pendingRequests } = useUserStore();

  return (
    <header className=" border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div
          className="flex items-center
         justify-between h-full"
        >
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-bold">Chatty</h1>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/settings"
              className={`btn btn-sm gap-2 transition-colors`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            {authUser && (
              <>
                <Link to="/profile" className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <Link to="/allUser" className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">AllUser</span>
                </Link>
                <Link to="/notifications" className="btn btn-sm gap-2 relative">
                  <Bell className="size-5" />
                  <span className="hidden sm:inline">Notifications</span>
                  {pendingRequests && pendingRequests.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5">
                      {pendingRequests.length}
                    </span>
                  )}
                </Link>
                <Link to="/friends" className="btn btn-sm gap-2">
                  <Users className="size-5" />
                  <span className="hidden sm:inline">Amis</span>
                </Link>
                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
