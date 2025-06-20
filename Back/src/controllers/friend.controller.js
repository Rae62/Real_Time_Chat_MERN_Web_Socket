import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import mongoose from "mongoose";

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id; // Authenticated user
    const { targetUserId } = req.body;

    if (userId === targetUserId) {
      return res
        .status(400)
        .json({ message: "You cannot add yourself as a friend." });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found." });
    }

    if (
      user.friends.includes(targetUserId) ||
      user.friendRequestsSent.includes(targetUserId) ||
      targetUser.friendRequestsReceived.includes(userId)
    ) {
      return res
        .status(400)
        .json({ message: "Friend request already sent or already friends." });
    }

    user.friendRequestsSent.push(targetUserId);
    targetUser.friendRequestsReceived.push(userId);
    await user.save();
    await targetUser.save();

    // Emit socket event to target user
    const receiverSocketId = getReceiverSocketId(targetUserId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friend_request_received", {
        from: userId,
      });
    }

    res.status(200).json({ message: "Friend request sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id; // Authenticated user
    const { requesterId } = req.body;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found." });
    }

    // Remove from requests
    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => id.toString() !== requesterId
    );
    requester.friendRequestsSent = requester.friendRequestsSent.filter(
      (id) => id.toString() !== userId
    );

    // Add to friends
    user.friends.push(requesterId);
    requester.friends.push(userId);
    await user.save();
    await requester.save();

    // Emit socket event to requester
    const requesterSocketId = getReceiverSocketId(requesterId.toString());
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friend_request_accepted", {
        from: userId,
      });
    }

    res.status(200).json({ message: "Friend request accepted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Decline a friend request
export const declineFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id; // Authenticated user
    const { requesterId } = req.body;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: "User not found." });
    }

    // Remove from requests
    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => id.toString() !== requesterId.toString()
    );
    requester.friendRequestsSent = requester.friendRequestsSent.filter(
      (id) => id.toString() !== userId.toString()
    );
    await user.save();
    await requester.save();

    // Emit socket event to requester
    const requesterSocketId = getReceiverSocketId(requesterId.toString());
    if (requesterSocketId) {
      io.to(requesterSocketId).emit("friend_request_declined", {
        from: userId,
      });
    }

    res.status(200).json({ message: "Friend request declined." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications (pending friend requests)
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "friendRequestsReceived",
      "fullName email profileAvatar"
    );
    res.status(200).json({ requests: user.friendRequestsReceived });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get friend list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "friends",
      "fullName email profileAvatar"
    );
    res.status(200).json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a friend
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.body;

    // Remove from both users' friends and requests arrays atomically
    await mongoose.model("User").updateOne(
      { _id: userId },
      {
        $pull: {
          friends: friendId,
          friendRequestsSent: friendId,
          friendRequestsReceived: friendId,
        },
      }
    );
    await mongoose.model("User").updateOne(
      { _id: friendId },
      {
        $pull: {
          friends: userId,
          friendRequestsSent: userId,
          friendRequestsReceived: userId,
        },
      }
    );

    // Emit socket event to friend
    const { getReceiverSocketId, io } = await import("../lib/socket.js");
    const friendSocketId = getReceiverSocketId(friendId.toString());
    if (friendSocketId) {
      io.to(friendSocketId).emit("friend_removed", { from: userId });
    }

    res.status(200).json({ message: "Friend removed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sent friend requests (pending requests sent by the user)
export const getSentFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate(
      "friendRequestsSent",
      "fullName email profileAvatar"
    );
    res.status(200).json({ sentRequests: user.friendRequestsSent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Block a user
export const blockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.body;
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetUserId);
    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found." });
    }
    // Remove only the blocked user's id from all relevant arrays
    user.friends = user.friends.filter(
      (id) => id.toString() !== targetUserId.toString()
    );
    user.friendRequestsSent = user.friendRequestsSent.filter(
      (id) => id.toString() !== targetUserId.toString()
    );
    user.friendRequestsReceived = user.friendRequestsReceived.filter(
      (id) => id.toString() !== targetUserId.toString()
    );
    targetUser.friends = targetUser.friends.filter(
      (id) => id.toString() !== userId.toString()
    );
    targetUser.friendRequestsSent = targetUser.friendRequestsSent.filter(
      (id) => id.toString() !== userId.toString()
    );
    targetUser.friendRequestsReceived =
      targetUser.friendRequestsReceived.filter(
        (id) => id.toString() !== userId.toString()
      );
    // Add to blockedUsers
    if (!user.blockedUsers.map((id) => id.toString()).includes(targetUserId)) {
      user.blockedUsers.push(targetUserId);
    }
    await user.save();
    await targetUser.save();
    // Emit socket event to blocked user
    const { getReceiverSocketId, io } = await import("../lib/socket.js");
    const targetSocketId = getReceiverSocketId(targetUserId.toString());
    if (targetSocketId) {
      io.to(targetSocketId).emit("user_blocked", { from: userId });
    }
    res.status(200).json({ message: "User blocked." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unblock a user
export const unblockUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.blockedUsers = user.blockedUsers.filter(
      (id) => id.toString() !== targetUserId
    );
    await user.save();
    // Emit socket event to unblocked user
    const { getReceiverSocketId, io } = await import("../lib/socket.js");
    const targetSocketId = getReceiverSocketId(targetUserId.toString());
    if (targetSocketId) {
      io.to(targetSocketId).emit("user_unblocked", { from: userId });
    }
    res.status(200).json({ message: "User unblocked." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get info for multiple users by IDs
export const getUsersByIds = async (req, res) => {
  try {
    const { ids } = req.body; // expects { ids: [id1, id2, ...] }
    const users = await User.find({ _id: { $in: ids } }).select(
      "fullName email profileAvatar _id"
    );
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users except the current user, including their blockedUsers field
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const users = await User.find({ _id: { $ne: userId } }).select(
      "fullName email profileAvatar _id blockedUsers"
    );
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
