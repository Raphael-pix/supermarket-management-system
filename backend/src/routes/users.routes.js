import { Router } from "express";
import { adminOnly, requireAuth } from "../middleware/rbac.js";
import {
  getAllUsers,
  promoteToAdmin,
  demoteToCustomer,
  getUserStats,
  syncClerkUser,
} from "../controllers/users.controller.js";

const router = Router();

router.post("/sync-clerk", requireAuth, syncClerkUser);

router.use(adminOnly);

router.get("/", getAllUsers);

router.get("/stats", getUserStats);

router.post("/:userId/promote", promoteToAdmin);

router.post("/:userId/demote", demoteToCustomer);

export default router;
