import { Router } from "express";
import { adminOnly } from "../middleware/rbac.js";
import {
  getInventory,
  getBranches,
  getProducts,
  restockBranch,
  getLowStock,
  restockHQ,
} from "../controllers/inventory.controller.js";

const router = Router();

router.use(adminOnly);

router.get("/", getInventory);

router.get("/branches", getBranches);

router.get("/products", getProducts);

router.get("/low-stock", getLowStock);

router.post("/restock", restockBranch);

router.post("/restockhq", restockHQ);

export default router;
