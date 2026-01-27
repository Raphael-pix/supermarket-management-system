import { Router } from "express";
import { adminOnly } from "../middleware/rbac.js";
import {
  getDashboardMetrics,
  getSalesTimeline,
  getRecentTransactions,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(adminOnly);

router.get("/metrics", getDashboardMetrics);

router.get("/sales-timeline", getSalesTimeline);

router.get("/recent-transactions", getRecentTransactions);

export default router;
