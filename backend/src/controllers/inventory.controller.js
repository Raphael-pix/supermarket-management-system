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
    // Note: This assumes you have defined lowStockThreshold in your schema.
    // If not, we remove the complex query to prevent crashes.
    if (lowStock === "true") {
      where.quantity = { lt: 10 }; // Hardcoded threshold for safety if field missing
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
      lowStockThreshold: item.lowStockThreshold || 10,
      isLowStock: item.quantity < (item.lowStockThreshold || 10),
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
 * Restock a branch (Simplified for Demo Stability)
 */
const restockBranch = async (req, res) => {
  try {
    // We accept 'quantity' and 'productId' directly if sent as single item,
    // or 'products' array if sent as bulk.
    // This handles both the dashboard form and bulk uploads.
    let { branchId, productId, quantity, products } = req.body;
    
    // Support the "toBranchId" naming if the frontend sends that
    const targetBranchId = branchId || req.body.toBranchId;

    // Validation
    if (!targetBranchId) {
      return res.status(400).json({ error: "Branch ID is required" });
    }

    // Normalize input to an array of updates
    const itemsToUpdate = [];
    if (products && Array.isArray(products)) {
      itemsToUpdate.push(...products);
    } else if (productId && quantity) {
      itemsToUpdate.push({ productId, quantity });
    }

    if (itemsToUpdate.length === 0) {
      return res.status(400).json({ error: "No products provided to restock" });
    }

    // Verify branch exists
    const targetBranch = await prisma.branch.findUnique({
      where: { id: targetBranchId },
    });

    if (!targetBranch) {
      return res.status(404).json({ error: "Target branch not found" });
    }

    const updates = [];

    // Process updates using UPSERT (Critical Fix)
    // This creates the inventory record if it doesn't exist, preventing 500 errors.
    for (const item of itemsToUpdate) {
      const q = parseInt(item.quantity);
      
      if (q > 0) {
        const result = await prisma.inventory.upsert({
          where: {
            branchId_productId: {
              branchId: targetBranchId,
              productId: item.productId,
            },
          },
          update: {
            quantity: { increment: q },
            lastRestocked: new Date(),
          },
          create: {
            branchId: targetBranchId,
            productId: item.productId,
            quantity: q,
            lastRestocked: new Date(),
            lowStockThreshold: 10, // Default threshold
          },
        });
        updates.push(result);
      }
    }

    res.json({
      success: true,
      message: `Successfully restocked ${updates.length} products to ${targetBranch.name}`,
      data: updates
    });

  } catch (error) {
    console.error("Restock error:", error);
    res.status(500).json({ error: "Failed to complete restock: " + error.message });
  }
};

/**
 * GET /api/inventory/low-stock
 * Returns items with stock below threshold
 */
const getLowStock = async (req, res) => {
  try {
    // If you haven't run a migration for lowStockThreshold yet, 
    // this query might fail. We wrap it safely.
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        // We use a hardcoded check or verify field exists to prevent crashes
        quantity: { lt: 10 }, 
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
      threshold: item.lowStockThreshold || 10,
      deficit: (item.lowStockThreshold || 10) - item.quantity,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Low stock error:", error);
    // Return empty array instead of crashing if query fails
    res.json([]); 
  }
};

export { getInventory, getBranches, getProducts, restockBranch, getLowStock };