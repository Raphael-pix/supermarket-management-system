import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * GET /api/dashboard/metrics
 * Returns comprehensive dashboard metrics
 */
const getDashboardMetrics = async (req, res) => {
  try {
    // 1. Total Revenue
    const totalRevenueResult = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
    });
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

    // 2. Total Number of Sales
    const totalSales = await prisma.sale.count();

    // 3. Revenue per Drink Brand
    const revenueByProduct = await prisma.$queryRaw`
      SELECT 
        p.name as product_name,
        SUM(si.subtotal) as revenue,
        SUM(si.quantity) as units_sold
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      GROUP BY p.name
      ORDER BY revenue DESC
    `;

    // 4. Sales per Branch
    const salesByBranch = await prisma.sale.groupBy({
      by: ["branchId"],
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Enrich with branch names
    const branchesMap = {};
    const branches = await prisma.branch.findMany();
    branches.forEach((b) => (branchesMap[b.id] = b.name));

    const salesByBranchEnriched = salesByBranch.map((item) => ({
      branchName: branchesMap[item.branchId],
      salesCount: item._count.id,
      revenue: item._sum.totalAmount || 0,
    }));

    // 5. Low Stock Alerts
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

    const lowStockAlerts = lowStockItems.map((item) => ({
      branch: item.branch.name,
      product: item.product.name,
      currentStock: item.quantity,
      threshold: item.lowStockThreshold,
    }));

    res.json({
      totalRevenue: parseFloat(totalRevenue),
      totalSales,
      revenueByProduct: revenueByProduct.map((item) => ({
        productName: item.product_name,
        revenue: parseFloat(item.revenue),
        unitsSold: parseInt(item.units_sold),
      })),
      salesByBranch: salesByBranchEnriched.map((item) => ({
        ...item,
        revenue: parseFloat(item.revenue),
      })),
      lowStockAlerts,
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
};

/**
 * GET /api/dashboard/sales-timeline
 * Returns daily sales data for the past 30 days
 */
const getSalesTimeline = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDay = await prisma.$queryRaw`
      SELECT 
        DATE("transactionDate") as date,
        COUNT(*)::int as sales_count,
        SUM("totalAmount") as revenue
      FROM "Sale"
      WHERE "transactionDate" >= ${thirtyDaysAgo}
      GROUP BY DATE("transactionDate")
      ORDER BY date ASC
    `;

    res.json(
      salesByDay.map((item) => ({
        date: item.date.toISOString().split("T")[0],
        salesCount: parseInt(item.sales_count),
        revenue: parseFloat(item.revenue),
      })),
    );
  } catch (error) {
    console.error("Sales timeline error:", error);
    res.status(500).json({ error: "Failed to fetch sales timeline" });
  }
};

/**
 * GET /api/dashboard/recent-transactions
 * Returns the 10 most recent transactions
 */
const getRecentTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentSales = await prisma.sale.findMany({
      take: limit,
      orderBy: {
        transactionDate: "desc",
      },
      include: {
        branch: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    const transactions = recentSales.map((sale) => ({
      id: sale.id,
      date: sale.transactionDate,
      branch: sale.branch.name,
      customerEmail: sale.customerEmail,
      amount: parseFloat(sale.totalAmount),
      mpesaReference: sale.mpesaReference,
      items: sale.items.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
        subtotal: parseFloat(item.subtotal),
      })),
    }));

    res.json(transactions);
  } catch (error) {
    console.error("Recent transactions error:", error);
    res.status(500).json({ error: "Failed to fetch recent transactions" });
  }
};

export { getDashboardMetrics, getSalesTimeline, getRecentTransactions };
