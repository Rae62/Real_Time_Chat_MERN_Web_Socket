import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersforSidebar = async (req, res) => {
  try {
    const loggedInId = req.user._id;
    // Get the user's friends
    const user = await User.findById(loggedInId).populate(
      "friends",
      "fullName email profileAvatar blockedUsers"
    );
    if (!user || !user.friends) {
      return res.status(200).json([]);
    }
    const friends = user.friends;

    // Exclude users who are blocked by or have blocked the current user
    const filteredFriends = await Promise.all(
      friends.map(async (friend) => {
        const friendDoc = await User.findById(friend._id);
        if (
          !friendDoc ||
          user.blockedUsers
            .map((id) => id.toString())
            .includes(friend._id.toString()) ||
          friendDoc.blockedUsers
            .map((id) => id.toString())
            .includes(loggedInId.toString())
        ) {
          return null;
        }
        const unreadCount = await Message.countDocuments({
          senderId: friend._id,
          receiverId: loggedInId,
          isRead: false,
        });
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInId, receiverId: friend._id },
            { senderId: friend._id, receiverId: loggedInId },
          ],
        }).sort({ createdAt: -1 });
        return {
          ...friend.toObject(),
          unreadCount,
          lastMessage,
        };
      })
    );

    // Remove nulls (blocked users)
    const sidebarData = filteredFriends.filter(Boolean);

    // Sort by most recent message
    sidebarData.sort((a, b) => {
      const aTime = a.lastMessage
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const bTime = b.lastMessage
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });

    res.status(200).json(sidebarData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: receiverUserId } = req.params;
    const myId = req.user._id;
    // Block check
    const me = await User.findById(myId);
    const other = await User.findById(receiverUserId);
    if (
      me.blockedUsers.map((id) => id.toString()).includes(receiverUserId) ||
      other.blockedUsers.map((id) => id.toString()).includes(myId.toString())
    ) {
      return res
        .status(403)
        .json({ message: "You cannot view messages with this user." });
    }
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: receiverUserId },
        { senderId: receiverUserId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverUserId } = req.params;
    const senderId = req.user._id;

    // Check if sender and receiver are friends
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverUserId);
    if (!sender.friends.map((f) => f.toString()).includes(receiverUserId)) {
      return res
        .status(403)
        .json({ message: "You can only message your friends." });
    }
    // Block check
    if (
      sender.blockedUsers.map((id) => id.toString()).includes(receiverUserId) ||
      receiver.blockedUsers
        .map((id) => id.toString())
        .includes(senderId.toString())
    ) {
      return res.status(403).json({ message: "You cannot message this user." });
    }

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: receiverUserId,
      text,
      image: imageUrl,
      isRead: false,
    });

    await newMessage.save();
    const receiverSocketId = getReceiverSocketId(receiverUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all messages from a user as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: senderId } = req.params;
    await Message.updateMany(
      { senderId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Messages marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
