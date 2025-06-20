import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function Sidebar() {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    markMessagesAsRead,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    markMessagesAsRead(user._id);
  };

  // Remove duplicate users by _id
  const uniqueUsers = Array.isArray(users)
    ? users.filter((u, i, arr) => arr.findIndex((x) => x._id === u._id) === i)
    : [];

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>
      <div className="overflow-y-auto w-full py-3">
        {uniqueUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => handleSelectUser(user)}
            className={
              `w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ` +
              (selectedUser?._id === user._id
                ? "bg-base-300 ring-1 ring-base-300"
                : "")
            }
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profileAvatar || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
              {user.unreadCount > 0 && selectedUser?._id !== user._id && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
                  {user.unreadCount}
                </span>
              )}
            </div>
            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400 truncate">
                {user.lastMessage
                  ? user.lastMessage.text || "[Image]"
                  : onlineUsers.includes(user._id)
                  ? "Online"
                  : "Offline"}
              </div>
              {user.lastMessage && (
                <div className="text-xs text-zinc-400 truncate">
                  {new Date(user.lastMessage.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
