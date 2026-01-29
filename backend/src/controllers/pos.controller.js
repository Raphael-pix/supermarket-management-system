import { PrismaClient } from "@prisma/client";
import mpesaService from "../services/mpesa.service.js";

const prisma = new PrismaClient();

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
    console.error(error);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
};

const getBranchProducts = async (req, res) => {
  try {
    const { branchId } = req.params;

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const inventory = await prisma.inventory.findMany({
      where: {
        branchId: branchId,
        quantity: { gt: 0 },
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
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

const previewOrder = async (req, res) => {
  try {
    const { branchId, items } = req.body;

    if (!branchId || !items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Branch ID and items are required" });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: "Invalid item data" });
      }

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
    console.error(error);
    res.status(500).json({ error: "Failed to preview order" });
  }
};

const initiatePayment = async (req, res) => {
  try {
    const { branchId, phoneNumber, items, totalAmount } = req.body;

    if (!branchId || !phoneNumber || !items || !totalAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      return res.status(404).json({ error: "Branch not found" });
    }

    const transactionRef =
      "POS" +
      Date.now() +
      Math.random().toString(36).substring(7).toUpperCase();

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

    res.json({
      success: true,
      transactionRef: transactionRef,
      checkoutRequestId: mpesaResponse.checkoutRequestId,
      merchantRequestId: mpesaResponse.merchantRequestId,
      message:
        "Payment request sent. Please enter your M-Pesa PIN on your phone.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
};

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

    res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });

    if (validation.success) {
      console.log("✅ Payment successful:", {
        mpesaRef: validation.mpesaReceiptNumber,
        amount: validation.amount,
        phone: validation.phoneNumber,
      });
    } else {
      console.log("❌ Payment failed:", validation.resultDesc);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Callback processing failed" });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { checkoutRequestId, branchId, phoneNumber, items, totalAmount } =
      req.body;

    const paymentStatus =
      await mpesaService.querySTKPushStatus(checkoutRequestId);

    if (!paymentStatus.success) {
      return res.status(400).json({
        success: false,
        error: paymentStatus.resultDesc || "Payment not confirmed",
      });
    }

    const mpesaReference =
      "MPX" +
      Date.now() +
      Math.random().toString(36).substring(7).toUpperCase();

    const defaultUser = await prisma.user.findFirst();

    if (!defaultUser) {
      return res
        .status(500)
        .json({
          success: false,
          error: "System Error: No valid admin/user found to link sale.",
        });
    }

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          branchId: branchId,
          totalAmount: totalAmount,
          mpesaReference: mpesaReference,
          transactionDate: new Date(),
        },
      });

      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            priceAtSale: item.price,
            subtotal: item.subtotal,
          },
        });

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
    console.error(error);

    if (error.code === "P2025") {
      return res.status(400).json({
        success: false,
        error: "Insufficient stock. Please refresh and try again.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to confirm payment: " + error.message,
    });
  }
};

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
      paymentMethod: "MPESA",
    };

    res.json(receipt);
  } catch (error) {
    console.error(error);
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
