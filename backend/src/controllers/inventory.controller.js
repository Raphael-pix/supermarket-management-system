import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * GET /api/inventory
 * Returns current inventory across all branches
 */
const getInventory = async (req, res) => {
  try {
    const { branchId, lowStock } = req.query;

    const where = {};
    if (branchId) {
      where.branchId = branchId;
    }
    if (lowStock === "true") {
      where.quantity = { lt: prisma.inventory.fields.lowStockThreshold };
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        branch: { select: { name: true, isHQ: true } },
        product: { select: { name: true, price: true } },
      },
      orderBy: [{ branch: { name: "asc" } }, { product: { name: "asc" } }],
    });

    const formattedInventory = inventory.map((item) => ({
      id: item.id,
      branch: item.branch.name,
      isHQ: item.branch.isHQ,
      product: item.product.name,
      price: parseFloat(item.product.price),
      quantity: item.quantity,
      lowStockThreshold: item.lowStockThreshold,
      isLowStock: item.quantity < item.lowStockThreshold,
      lastRestocked: item.lastRestocked,
    }));

    res.json(formattedInventory);
  } catch (error) {
    console.error("Get inventory error:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
};

/**
 * GET /api/inventory/branches
 * Returns list of all branches
 */
const getBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" },
    });

    res.json(branches);
  } catch (error) {
    console.error("Get branches error:", error);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
};

/**
 * GET /api/inventory/products
 * Returns list of all products
 */
const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    res.json(
      products.map((p) => ({
        ...p,
        price: parseFloat(p.price),
      })),
    );
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * POST /api/inventory/restock
 * Restock a branch from HQ
 */
const restockBranch = async (req, res) => {
  try {
    const { toBranchId, products, notes } = req.body;
    const performedBy = req.userId; // From auth middleware

    // Validation
    if (!toBranchId || !products || !Array.isArray(products)) {
      return res.status(400).json({
        error: "Invalid request. Required: toBranchId, products (array)",
      });
    }

    // Get HQ branch
    const hqBranch = await prisma.branch.findFirst({
      where: { isHQ: true },
    });

    if (!hqBranch) {
      return res.status(404).json({ error: "HQ branch not found" });
    }

    // Validate target branch
    const targetBranch = await prisma.branch.findUnique({
      where: { id: toBranchId },
    });

    if (!targetBranch) {
      return res.status(404).json({ error: "Target branch not found" });
    }

    if (targetBranch.isHQ) {
      return res.status(400).json({ error: "Cannot restock HQ from itself" });
    }

    // Process restock - update inventory for each product
    const updates = [];
    for (const item of products) {
      const { productId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          error: "Each product must have productId and positive quantity",
        });
      }

      // Check HQ has enough stock
      const hqInventory = await prisma.inventory.findUnique({
        where: {
          branchId_productId: {
            branchId: hqBranch.id,
            productId: productId,
          },
        },
      });

      if (!hqInventory || hqInventory.quantity < quantity) {
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });
        return res.status(400).json({
          error: `Insufficient stock in HQ for ${product?.name || "product"}. Available: ${hqInventory?.quantity || 0}`,
        });
      }

      // Deduct from HQ
      await prisma.inventory.update({
        where: {
          branchId_productId: {
            branchId: hqBranch.id,
            productId: productId,
          },
        },
        data: {
          quantity: {
            decrement: quantity,
          },
        },
      });

      // Add to target branch
      await prisma.inventory.update({
        where: {
          branchId_productId: {
            branchId: toBranchId,
            productId: productId,
          },
        },
        data: {
          quantity: {
            increment: quantity,
          },
          lastRestocked: new Date(),
        },
      });

      updates.push({ productId, quantity });
    }

    // Log the restock operation
    const restockLog = await prisma.restockLog.create({
      data: {
        fromBranchId: hqBranch.id,
        toBranchId,
        performedById: performedBy,
        notes,
        items: {
          create: products.map((p) => ({
            productId: p.productId,
            quantity: p.quantity,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json({
      message: "Restock completed successfully",
      restockLog: {
        id: restockLog.id,
        fromBranch: hqBranch.name,
        toBranch: targetBranch.name,
        products: updates,
        performedAt: restockLog.createdAt,
      },
    });
  } catch (error) {
    console.error("Restock error:", error);
    res.status(500).json({ error: "Failed to complete restock operation" });
  }
};

/**
 * GET /api/inventory/low-stock
 * Returns items with stock below threshold
 */
const getLowStock = async (req, res) => {
  try {
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        quantity: {
          lt: prisma.inventory.fields.lowStockThreshold,
        },
      },
      include: {
        branch: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: {
        quantity: "asc",
      },
    });

    const formatted = lowStockItems.map((item) => ({
      branch: item.branch.name,
      product: item.product.name,
      currentStock: item.quantity,
      threshold: item.lowStockThreshold,
      deficit: item.lowStockThreshold - item.quantity,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Low stock error:", error);
    res.status(500).json({ error: "Failed to fetch low stock items" });
  }
};

export { getInventory, getBranches, getProducts, restockBranch, getLowStock };
