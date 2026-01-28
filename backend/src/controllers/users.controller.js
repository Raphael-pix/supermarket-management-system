import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/users
 * Returns all users in the system
 */
const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    const where = {};
    if (role) {
      where.role = role.toUpperCase();
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        promotedBy: true,
        promotedAt: true,
        lastLoginAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/**
 * POST /api/users/:userId/promote
 * Promote a user to admin
 */
const promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const performedBy = req.userId;

    const userToPromote = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToPromote) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToPromote.role === "ADMIN") {
      return res.status(400).json({ error: "User is already an admin" });
    }

    // Update user role in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "ADMIN",
        promotedBy: performedBy,
        promotedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        role: true,
        promotedAt: true,
      },
    });

    res.json({
      message: "User promoted to admin successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Promote user error:", error);
    res.status(500).json({ error: "Failed to promote user" });
  }
};

/**
 * POST /api/users/:userId/demote
 * Demote an admin to customer (with safeguards)
 */
const demoteToCustomer = async (req, res) => {
  try {
    const { userId } = req.params;

    const userToDemote = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDemote) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToDemote.role !== "ADMIN") {
      return res.status(400).json({ error: "User is not an admin" });
    }

    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount <= 1) {
      return res.status(400).json({
        error: "Cannot demote the last admin. Promote another user first.",
      });
    }

    // Prevent self-demotion
    if (userToDemote.id === req.userId) {
      return res.status(400).json({
        error: "You cannot demote yourself",
      });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: "USER",
        promotedBy: null,
        promotedAt: null,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    res.json({
      message: "User demoted to user successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Demote user error:", error);
    res.status(500).json({ error: "Failed to demote user" });
  }
};

/**
 * GET /api/users/stats
 * Returns user statistics
 */
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const customerCount = await prisma.user.count({
      where: { role: "USER" },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSignUps = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    res.json({
      totalUsers,
      adminCount,
      customerCount,
      recentSignUps,
    });
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
};

export { getAllUsers, promoteToAdmin, demoteToCustomer, getUserStats };
