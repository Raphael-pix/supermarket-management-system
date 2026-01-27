import { PrismaClient } from "@prisma/client";
import mpesaService from "../services/mpesa.service.js";

const prisma = new PrismaClient();

/**
 * GET /api/pos/branches
 * Get all available branches for POS
 */
const getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      select: {
        id: true,
        name: true,
        location: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(branches);
  } catch (error) {
    console.error("Get branches error:", error);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
};

/**
 * GET /api/pos/branches/:branchId/products
 * Get available products with stock for a specific branch
 */
const getBranchProducts = async (req, res) => {
  try {
    const { branchId } = req.params;

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    // Get products with inventory for this branch
    const inventory = await prisma.inventory.findMany({
      where: {
        branchId: branchId,
        quantity: { gt: 0 }, // Only show products with stock
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
          },
        },
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

    const products = inventory.map((inv) => ({
      id: inv.product.id,
      name: inv.product.name,
      price: parseFloat(inv.product.price),
      description: inv.product.description,
      availableStock: inv.quantity,
    }));

    res.json({
      branch: {
        id: branch.id,
        name: branch.name,
        location: branch.location,
      },
      products,
    });
  } catch (error) {
    console.error("Get branch products error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * POST /api/pos/order/preview
 * Preview order total and validate stock
 */
const previewOrder = async (req, res) => {
  try {
    const { branchId, items } = req.body;

    // Validation
    if (!branchId || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Branch ID and items are required" });
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const orderItems = [];
    let total = 0;

    // Validate each item and check stock
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: "Invalid item data" });
      }

      // Get product and inventory
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res
          .status(404)
          .json({ error: `Product not found: ${productId}` });
      }

      const inventory = await prisma.inventory.findUnique({
        where: {
          branchId_productId: {
            branchId: branchId,
            productId: productId,
          },
        },
      });

      if (!inventory || inventory.quantity < quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${inventory?.quantity || 0}`,
        });
      }

      const price = parseFloat(product.price);
      const subtotal = price * quantity;

      orderItems.push({
        productId: product.id,
        name: product.name,
        quantity: quantity,
        price: price,
        subtotal: subtotal,
      });

      total += subtotal;
    }

    res.json({
      branch: {
        id: branch.id,
        name: branch.name,
      },
      items: orderItems,
      total: total,
    });
  } catch (error) {
    console.error("Preview order error:", error);
    res.status(500).json({ error: "Failed to preview order" });
  }
};

/**
 * POST /api/pos/payment/initiate
 * Initiate M-Pesa STK Push
 */
const initiatePayment = async (req, res) => {
  try {
    const { branchId, phoneNumber, items, totalAmount } = req.body;

    // Validation
    if (!branchId || !phoneNumber || !items || !totalAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify branch exists
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    // Generate unique transaction reference
    const transactionRef =
      "POS" +
      Date.now() +
      Math.random().toString(36).substring(7).toUpperCase();

    // Initiate M-Pesa STK Push
    const mpesaResponse = await mpesaService.initiateSTKPush(
      phoneNumber,
      totalAmount,
      transactionRef,
      `Purchase at ${branch.name}`,
    );

    if (!mpesaResponse.success) {
      return res.status(400).json({
        error: mpesaResponse.error || "Failed to initiate payment",
      });
    }

    // Store pending payment info in database for callback processing
    // We'll use the Sale model with a pending status indicator
    // For now, return the checkout request ID for polling
    res.json({
      success: true,
      transactionRef: transactionRef,
      checkoutRequestId: mpesaResponse.checkoutRequestId,
      merchantRequestId: mpesaResponse.merchantRequestId,
      message:
        "Payment request sent. Please enter your M-Pesa PIN on your phone.",
    });
  } catch (error) {
    console.error("Initiate payment error:", error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

/**
 * POST /api/pos/payment/callback
 * M-Pesa callback endpoint (called by Safaricom)
 */
const paymentCallback = async (req, res) => {
  try {
    console.log(
      "📞 M-Pesa Callback received:",
      JSON.stringify(req.body, null, 2),
    );

    const validation = mpesaService.validateCallback(req.body);

    if (!validation.valid) {
      console.error("Invalid callback data:", validation.error);
      return res.status(400).json({ error: validation.error });
    }

    // Acknowledge callback immediately
    res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });

    // Process payment asynchronously
    if (validation.success) {
      console.log("✅ Payment successful:", {
        mpesaRef: validation.mpesaReceiptNumber,
        amount: validation.amount,
        phone: validation.phoneNumber,
      });

      // Payment will be confirmed via polling or webhook
      // The actual sale creation happens in confirmPayment function
    } else {
      console.log("❌ Payment failed:", validation.resultDesc);
    }
  } catch (error) {
    console.error("Payment callback error:", error);
    res.status(500).json({ error: "Callback processing failed" });
  }
};

/**
 * POST /api/pos/payment/confirm
 * Confirm payment and create sale (called by frontend after STK Push)
 */
const confirmPayment = async (req, res) => {
  try {
    const { checkoutRequestId, branchId, phoneNumber, items, totalAmount } =
      req.body;

    // Query M-Pesa for payment status
    const paymentStatus =
      await mpesaService.querySTKPushStatus(checkoutRequestId);

    if (!paymentStatus.success) {
      return res.status(400).json({
        success: false,
        error: paymentStatus.resultDesc || "Payment not confirmed",
      });
    }

    // Generate unique M-Pesa reference (in production, this comes from callback)
    const mpesaReference =
      "MPX" +
      Date.now() +
      Math.random().toString(36).substring(7).toUpperCase();

    // Use database transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create sale
      const sale = await tx.sale.create({
        data: {
          branchId: branchId,
          customerId: "POS_CUSTOMER", // No customer account for POS
          customerEmail: phoneNumber + "@pos.local", // Use phone as identifier
          totalAmount: totalAmount,
          paymentMethod: "MPESA",
          mpesaReference: mpesaReference,
          transactionDate: new Date(),
        },
      });

      // 2. Create sale items and deduct inventory
      for (const item of items) {
        // Create sale item
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: item.price,
            subtotal: item.subtotal,
          },
        });

        // Deduct from inventory
        await tx.inventory.update({
          where: {
            branchId_productId: {
              branchId: branchId,
              productId: item.productId,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return sale;
    });

    res.json({
      success: true,
      saleId: result.id,
      transactionRef: result.mpesaReference,
      message: "Payment confirmed and sale recorded",
    });
  } catch (error) {
    console.error("Confirm payment error:", error);

    // Check for insufficient stock error
    if (error.code === "P2025") {
      return res.status(400).json({
        success: false,
        error: "Insufficient stock. Please refresh and try again.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to confirm payment",
    });
  }
};

/**
 * GET /api/pos/receipt/:transactionRef
 * Get receipt details for a transaction
 */
const getReceipt = async (req, res) => {
  try {
    const { transactionRef } = req.params;

    const sale = await prisma.sale.findFirst({
      where: {
        mpesaReference: transactionRef,
      },
      include: {
        branch: {
          select: {
            name: true,
            location: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    const receipt = {
      transactionRef: sale.mpesaReference,
      branch: sale.branch.name,
      location: sale.branch.location,
      date: sale.transactionDate,
      items: sale.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.priceAtSale),
        subtotal: parseFloat(item.subtotal),
      })),
      total: parseFloat(sale.totalAmount),
      paymentMethod: sale.paymentMethod,
    };

    res.json(receipt);
  } catch (error) {
    console.error("Get receipt error:", error);
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
};

export {
  getBranches,
  getBranchProducts,
  previewOrder,
  initiatePayment,
  paymentCallback,
  confirmPayment,
  getReceipt,
};
