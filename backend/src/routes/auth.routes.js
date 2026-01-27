import { Router } from "express";
import { requireAuth } from "../middleware/rbac.js";
import {
  signup,
  login,
  getCurrentUser,
  changePassword,
} from "../controllers/auth.controller.js";

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (require authentication)
router.get("/me", requireAuth, getCurrentUser);
router.post("/change-password", requireAuth, changePassword);

export default router;
