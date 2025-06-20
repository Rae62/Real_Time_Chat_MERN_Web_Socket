import React, { useEffect } from "react";
import { useUserStore } from "../store/useUserStore";

export default function NotificationPage() {
  const {
    pendingRequests,
    fetchPendingRequests,
    acceptFriend,
    declineFriend,
    loading,
    error,
  } = useUserStore();

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleAccept = async (requesterId) => {
    await acceptFriend(requesterId);
  };

  const handleDecline = async (requesterId) => {
    await declineFriend(requesterId);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p>Chargement des notifications...</p>
      ) : pendingRequests.length === 0 ? (
        <p>Aucune demande d'ami en attente.</p>
      ) : (
        <div className="grid gap-4">
          {pendingRequests.map((user) => (
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
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(user._id)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                  disabled={loading}
                >
                  Accepter
                </button>
                <button
                  onClick={() => handleDecline(user._id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
                  disabled={loading}
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
