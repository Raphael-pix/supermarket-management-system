import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * GET /api/sales/reports
 * Returns consolidated sales reports
 */
const getSalesReports = async (req, res) => {
  try {
    const { startDate, endDate, branchId, productId } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    const where = {};
    if (Object.keys(dateFilter).length > 0) {
      where.transactionDate = dateFilter;
    }
    if (branchId) {
      where.branchId = branchId;
    }

    // 1. Overall Summary
    const overallSummary = await prisma.sale.aggregate({
      where,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // 2. Sales by Product
    const salesByProductQuery = `
      SELECT 
        p.id,
        p.name as product_name,
        SUM(si.quantity)::int as total_quantity,
        SUM(si.subtotal) as total_revenue
      FROM "SaleItem" si
      JOIN "Product" p ON si."productId" = p.id
      JOIN "Sale" s ON si."saleId" = s.id
      WHERE 1=1
      ${where.transactionDate?.gte ? `AND s."transactionDate" >= '${where.transactionDate.gte.toISOString()}'` : ""}
      ${where.transactionDate?.lte ? `AND s."transactionDate" <= '${where.transactionDate.lte.toISOString()}'` : ""}
      ${where.branchId ? `AND s."branchId" = '${where.branchId}'` : ""}
      ${productId ? `AND p.id = '${productId}'` : ""}
      GROUP BY p.id, p.name
      ORDER BY total_revenue DESC
    `;

    const salesByProduct = await prisma.$queryRawUnsafe(salesByProductQuery);

    // 3. Sales by Branch
    const salesByBranch = await prisma.sale.groupBy({
      by: ["branchId"],
      where,
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Enrich with branch names
    const branches = await prisma.branch.findMany();
    const branchesMap = {};
    branches.forEach((b) => (branchesMap[b.id] = b.name));

    const salesByBranchEnriched = salesByBranch.map((item) => ({
      branchId: item.branchId,
      branchName: branchesMap[item.branchId],
      totalSales: item._count.id,
      totalRevenue: parseFloat(item._sum.totalAmount || 0),
    }));

    // 4. Top selling products
    const topProducts = salesByProduct.slice(0, 5);

    res.json({
      summary: {
        totalRevenue: parseFloat(overallSummary._sum.totalAmount || 0),
        totalSales: overallSummary._count.id,
      },
      salesByProduct: salesByProduct.map((item) => ({
        productId: item.id,
        productName: item.product_name,
        quantitySold: parseInt(item.total_quantity),
        revenue: parseFloat(item.total_revenue),
      })),
      salesByBranch: salesByBranchEnriched,
      topProducts: topProducts.map((item) => ({
        productName: item.product_name,
        quantitySold: parseInt(item.total_quantity),
        revenue: parseFloat(item.total_revenue),
      })),
    });
  } catch (error) {
    console.error("Sales reports error:", error);
    res.status(500).json({ error: "Failed to generate sales reports" });
  }
};

/**
 * GET /api/sales/detailed
 * Returns detailed sales data with all transactions
 */
const getDetailedSales = async (req, res) => {
  try {
    const { page = 1, limit = 50, branchId, startDate, endDate } = req.query;

    const where = {};
    if (branchId) {
      where.branchId = branchId;
    }
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sales, totalCount] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: parseInt(limit),
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
      }),
      prisma.sale.count({ where }),
    ]);

    const formattedSales = sales.map((sale) => ({
      id: sale.id,
      branch: sale.branch.name,
      totalAmount: parseFloat(sale.totalAmount),
      mpesaReference: sale.mpesaReference,
      transactionDate: sale.transactionDate,
      items: sale.items.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
        priceAtSale: parseFloat(item.priceAtSale),
        subtotal: parseFloat(item.subtotal),
      })),
    }));

    res.json({
      sales: formattedSales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Detailed sales error:", error);
    res.status(500).json({ error: "Failed to fetch detailed sales" });
  }
};

/**
 * GET /api/sales/analytics
 * Returns advanced analytics
 */
const getSalesAnalytics = async (req, res) => {
  try {
    // Average transaction value
    const avgTransaction = await prisma.sale.aggregate({
      _avg: {
        totalAmount: true,
      },
    });

    // Sales by day of week
    const salesByDayOfWeek = await prisma.$queryRaw`
      SELECT 
        EXTRACT(DOW FROM "transactionDate")::int as day_of_week,
        COUNT(*)::int as sales_count,
        SUM("totalAmount") as revenue
      FROM "Sale"
      WHERE "transactionDate" >= NOW() - INTERVAL '30 days'
      GROUP BY day_of_week
      ORDER BY day_of_week
    `;

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    res.json({
      averageTransactionValue: parseFloat(avgTransaction._avg.totalAmount || 0),
      salesByDayOfWeek: salesByDayOfWeek.map((item) => ({
        day: dayNames[item.day_of_week],
        salesCount: parseInt(item.sales_count),
        revenue: parseFloat(item.revenue),
      })),
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    res.status(500).json({ error: "Failed to fetch sales analytics" });
  }
};

export { getSalesReports, getDetailedSales, getSalesAnalytics };
