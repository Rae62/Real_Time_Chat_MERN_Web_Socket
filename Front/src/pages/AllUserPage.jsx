import React from "react";
import { useUserStore } from "../store/useUserStore";
import { useAuthStore } from "../store/useAuthStore";

export default function AllUserPage() {
  // Use Zustand selectors for all relevant state
  const allUsers = useUserStore((state) => state.allUsers);
  const getAllUsers = useUserStore((state) => state.getAllUsers);
  const loading = useUserStore((state) => state.loading);
  const error = useUserStore((state) => state.error);
  const addFriend = useUserStore((state) => state.addFriend);
  const friends = useUserStore((state) => state.friends);
  const pendingRequests = useUserStore((state) => state.pendingRequests);
  const sentRequests = useUserStore((state) => state.sentRequests);
  const fetchFriends = useUserStore((state) => state.fetchFriends);
  const fetchPendingRequests = useUserStore(
    (state) => state.fetchPendingRequests
  );
  const fetchSentRequests = useUserStore((state) => state.fetchSentRequests);
  const { authUser } = useAuthStore();

  React.useEffect(() => {
    getAllUsers();
    fetchFriends();
    fetchPendingRequests();
    fetchSentRequests();
    // eslint-disable-next-line
  }, []);

  const handleAddFriend = async (friendId) => {
    await addFriend(friendId);
  };

  // Get blocked users from authUser
  const blockedUsers = (authUser?.blockedUsers || []).map((id) =>
    id.toString()
  );
  // Get users who have blocked the current user
  const blockedBy = allUsers
    .filter((u) =>
      (u.blockedUsers || [])
        .map((id) => id.toString())
        .includes(authUser?._id?.toString())
    )
    .map((u) => u._id);

  if (loading) return <p>Chargement des utilisateurs...</p>;

  // Helper to determine button state
  const getFriendStatus = (user) => {
    if (!authUser || user._id === authUser._id) return null;
    if (friends.some((f) => f._id === user._id)) return "friend";
    if (pendingRequests.some((req) => req._id === user._id)) return "pending";
    if (sentRequests.some((req) => req._id === user._id)) return "pending";
    return "none";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">All Users</h1>

      {/* Affichage de l'erreur */}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid gap-4">
        {allUsers
          .filter(
            (user) =>
              !blockedUsers.includes(user._id.toString()) &&
              !blockedBy
                .map((id) => id.toString())
                .includes(user._id.toString())
          )
          .map((user) => {
            const status = getFriendStatus(user);
            return (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 bg-base-200 rounded-lg shadow-sm"
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
                {status === null ? null : status === "friend" ? (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm cursor-default"
                    disabled
                  >
                    Ami
                  </button>
                ) : status === "pending" ? (
                  <button
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md text-sm cursor-default"
                    disabled
                  >
                    En attente...
                  </button>
                ) : (
                  <button
                    onClick={() => handleAddFriend(user._id)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm disabled:opacity-50"
                  >
                    {loading ? "Ajout en cours..." : "Ajouter en ami"}
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
