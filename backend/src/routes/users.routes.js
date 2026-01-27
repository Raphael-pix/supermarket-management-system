import { Router } from "express";
import { adminOnly } from "../middleware/rbac.js";
import {
  getAllUsers,
  promoteToAdmin,
  demoteToCustomer,
  getUserStats,
} from "../controllers/users.controller.js";

const router = Router();

router.use(adminOnly);

router.get("/", getAllUsers);

router.get("/stats", getUserStats);

router.post("/:userId/promote", promoteToAdmin);

router.post("/:userId/demote", demoteToCustomer);

export default router;
