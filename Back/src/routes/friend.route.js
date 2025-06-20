import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend,
  getSentFriendRequests,
  blockUser,
  unblockUser,
  getUsersByIds,
  getAllUsers,
} from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Send a friend request
router.post("/request", protectRoute, sendFriendRequest);
// Accept a friend request
router.post("/accept", protectRoute, acceptFriendRequest);
// Decline a friend request
router.post("/decline", protectRoute, declineFriendRequest);
// Get pending friend requests (notifications)
router.get("/requests", protectRoute, getFriendRequests);
// Get friend list
router.get("/list", protectRoute, getFriends);
// Remove a friend
router.post("/remove", protectRoute, removeFriend);
// Get sent friend requests
router.get("/sent-requests", protectRoute, getSentFriendRequests);
// Block a user
router.post("/block", protectRoute, blockUser);
// Unblock a user
router.post("/unblock", protectRoute, unblockUser);
// Get info for multiple users by IDs
router.post("/users-by-ids", protectRoute, getUsersByIds);
// Get all users except the current user
router.get("/all-users", protectRoute, getAllUsers);

export default router;
