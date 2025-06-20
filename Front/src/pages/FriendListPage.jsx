import React, { useEffect, useState, useMemo } from "react";
import { useUserStore } from "../store/useUserStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";

export default function FriendListPage() {
  const {
    friends,
    fetchFriends,
    loading,
    error,
    removeFriend,
    blockFriend,
    unblockFriend,
  } = useUserStore();
  const { authUser } = useAuthStore();
  const [blockedUserInfos, setBlockedUserInfos] = useState([]);

  // Always use blockedUsers from Zustand authUser, but memoize it
  const blockedUsers = useMemo(
    () => (authUser?.blockedUsers || []).map((id) => id.toString()),
    [authUser?.blockedUsers]
  );

  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Fetch user info for blocked users
    if (blockedUsers.length > 0) {
      axiosInstance
        .post("/friend/users-by-ids", { ids: blockedUsers })
        .then((res) => {
          setBlockedUserInfos(res.data.users);
        });
    } else {
      setBlockedUserInfos([]);
    }
  }, [blockedUsers]);

  const handleRemove = async (friendId) => {
    await removeFriend(friendId);
  };

  const handleBlock = async (friendId) => {
    await blockFriend(friendId);
  };

  const handleUnblock = async (userId) => {
    await unblockFriend(userId);
  };

  // Remove duplicate friends by _id
  const uniqueFriends = Array.isArray(friends)
    ? friends.filter((f, i, arr) => arr.findIndex((u) => u._id === f._id) === i)
    : [];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Mes Amis</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Chargement de la liste d'amis...</p>
      ) : uniqueFriends.length === 0 ? (
        <p>Vous n'avez pas encore d'amis.</p>
      ) : (
        <div className="grid gap-4">
          {uniqueFriends.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-4 bg-base-200 rounded-lg shadow-sm justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.profileAvatar || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium">{user.fullName}</div>
                  <div className="text-sm text-zinc-500">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => handleRemove(user._id)}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                disabled={loading}
              >
                {loading ? "Suppression..." : "Supprimer"}
              </button>
              <button
                onClick={() => handleBlock(user._id)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm ml-2"
                disabled={loading}
              >
                Bloquer
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Blocked users section */}
      {blockedUserInfos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Utilisateurs bloqués</h2>
          <div className="grid gap-4">
            {blockedUserInfos.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-4 bg-base-200 rounded-lg shadow-sm justify-between"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.profileAvatar || "/avatar.png"}
                    alt={user.fullName}
                    className="size-8 rounded-full"
                  />
                  <div className="font-medium">{user.fullName}</div>
                </div>
                <button
                  onClick={() => handleUnblock(user._id)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                  disabled={loading}
                >
                  Débloquer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
