import express from "express";
import {
  checkAuthentification,
  login,
  logout,
  signup,
  updateProfile,
  addFriend,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuthentification);
router.post("/add-friend/:friendId", checkAuthentification, addFriend);

export default router;
