import { Router } from "express";
import { adminOnly } from "../middleware/rbac.js";
import {
  getSalesReports,
  getDetailedSales,
  getSalesAnalytics,
} from "../controllers/sales.controller.js";

const router = Router();

router.use(adminOnly);

router.get("/reports", getSalesReports);

router.get("/detailed", getDetailedSales);

router.get("/analytics", getSalesAnalytics);

export default router;
