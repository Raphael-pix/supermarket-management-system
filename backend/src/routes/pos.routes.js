import { Router } from "express";
const router = Router();
import {
  getBranches,
  getBranchProducts,
  previewOrder,
  initiatePayment,
  paymentCallback,
  confirmPayment,
  getReceipt,
} from "../controllers/pos.controller.js";

// Branch & Inventory routes
router.get("/branches", getBranches);
router.get("/branches/:branchId/products", getBranchProducts);

// Order routes
router.post("/order/preview", previewOrder);

// Payment routes
router.post("/payment/initiate", initiatePayment);
router.post("/payment/callback", paymentCallback);
router.post("/payment/confirm", confirmPayment);

// Receipt route
router.get("/receipt/:transactionRef", getReceipt);

export default router;
